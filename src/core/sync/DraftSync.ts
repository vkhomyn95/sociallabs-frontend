import { TypedEmitter } from '@/core/workflow/TypedEmitter'
import { compactOps } from './compactOps'
import { DraftConflictError, DraftRejectedError, type DraftApi } from './DraftApi'
import type { DraftOp } from './ops'

export enum SyncStatus {
  /** Server has every change. */
  SAVED = 'SAVED',
  /** Changes wait for the debounce. */
  UNSAVED = 'UNSAVED',
  SAVING = 'SAVING',
  /** Last save failed on the network or the server; retrying with backoff. */
  RETRYING = 'RETRYING',
  /** The draft changed elsewhere; saving stops until the editor reloads. */
  CONFLICT = 'CONFLICT',
  /** The server refused the changes; saving stops until the editor reloads. */
  FAILED = 'FAILED',
}

export interface SyncEvents {
  status: [status: SyncStatus]
  saved: [revision: number]
}

export interface Scheduler {
  setTimeout(callback: () => void, ms: number): unknown
  clearTimeout(handle: unknown): void
}

export interface DraftSyncOptions {
  debounceMs?: number
  /** Delays before each retry of a failed save; the last one repeats. */
  retryDelaysMs?: readonly number[]
  scheduler?: Scheduler
}

const BLOCKED = new Set([SyncStatus.CONFLICT, SyncStatus.FAILED])

const browserScheduler: Scheduler = {
  setTimeout: (callback, ms) => globalThis.setTimeout(callback, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
}

/**
 * Saves draft operations in batches: queue → debounce → one PATCH at a time with the revision the batch is
 * based on. Unsaved operations are never dropped: on a conflict they stay queued until the editor reloads.
 */
export class DraftSync {
  readonly events = new TypedEmitter<SyncEvents>()
  private queue: DraftOp[] = []
  private inFlight: Promise<void> | null = null
  private timer: unknown = null
  private failures = 0
  private currentStatus = SyncStatus.SAVED
  private lastError: Error | null = null
  private readonly debounceMs: number
  private readonly retryDelaysMs: readonly number[]
  private readonly scheduler: Scheduler

  constructor(
    private readonly api: DraftApi,
    private readonly workflowId: number,
    private baseRevision: number,
    options: DraftSyncOptions = {},
  ) {
    this.debounceMs = options.debounceMs ?? 800
    this.retryDelaysMs = options.retryDelaysMs ?? [1000, 2000, 5000, 10000, 30000]
    this.scheduler = options.scheduler ?? browserScheduler
  }

  get status(): SyncStatus {
    return this.currentStatus
  }

  get revision(): number {
    return this.baseRevision
  }

  get error(): Error | null {
    return this.lastError
  }

  /** @returns whether some change has not reached the server yet */
  get hasUnsavedChanges(): boolean {
    return this.queue.length > 0 || this.inFlight !== null
  }

  enqueue(ops: readonly DraftOp[]): void {
    if (!ops.length) return
    this.queue.push(...ops)
    if (BLOCKED.has(this.currentStatus)) return
    if (this.currentStatus !== SyncStatus.SAVING && this.currentStatus !== SyncStatus.RETRYING) {
      this.setStatus(SyncStatus.UNSAVED)
    }
    if (this.currentStatus !== SyncStatus.RETRYING) this.schedule(this.debounceMs)
  }

  /**
   * Save everything now, e.g. before publishing or running the workflow.
   *
   * @throws DraftConflictError or DraftRejectedError when saving is blocked; other errors of the last attempt
   */
  async flush(): Promise<void> {
    this.cancelTimer()
    while (this.inFlight || this.queue.length) {
      if (!this.inFlight) {
        if (BLOCKED.has(this.currentStatus)) throw this.lastError
        this.inFlight = this.sendBatch().finally(() => (this.inFlight = null))
      }
      await this.inFlight
      if (this.currentStatus === SyncStatus.RETRYING || BLOCKED.has(this.currentStatus)) throw this.lastError
    }
  }

  /** Drop unsaved operations and continue from a freshly loaded draft. */
  reset(revision: number): void {
    this.cancelTimer()
    this.queue = []
    this.failures = 0
    this.lastError = null
    this.baseRevision = revision
    this.setStatus(SyncStatus.SAVED)
  }

  dispose(): void {
    this.cancelTimer()
  }

  private async sendBatch(): Promise<void> {
    const batch = compactOps(this.queue.splice(0))
    this.setStatus(SyncStatus.SAVING)
    try {
      const { revision } = await this.api.patch(this.workflowId, this.baseRevision, batch)
      this.baseRevision = revision
      this.failures = 0
      this.lastError = null
      this.events.emit('saved', revision)
      if (this.queue.length) {
        this.setStatus(SyncStatus.UNSAVED)
        this.schedule(this.debounceMs)
      } else {
        this.setStatus(SyncStatus.SAVED)
      }
    } catch (error) {
      this.queue.unshift(...batch)
      this.lastError = error instanceof Error ? error : new Error(String(error))
      if (error instanceof DraftConflictError) {
        this.setStatus(SyncStatus.CONFLICT)
      } else if (error instanceof DraftRejectedError) {
        this.setStatus(SyncStatus.FAILED)
      } else {
        // The request may have been applied before the connection dropped; a resend with the same base
        // revision then conflicts instead of applying twice.
        this.setStatus(SyncStatus.RETRYING)
        const delays = this.retryDelaysMs
        this.schedule(delays[Math.min(this.failures, delays.length - 1)] ?? this.debounceMs)
        this.failures++
      }
    }
  }

  private schedule(ms: number): void {
    this.cancelTimer()
    this.timer = this.scheduler.setTimeout(() => {
      this.timer = null
      this.flush().catch(() => undefined)
    }, ms)
  }

  private cancelTimer(): void {
    if (this.timer !== null) this.scheduler.clearTimeout(this.timer)
    this.timer = null
  }

  private setStatus(status: SyncStatus): void {
    if (status === this.currentStatus) return
    this.currentStatus = status
    this.events.emit('status', status)
  }
}

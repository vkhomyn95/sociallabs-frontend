import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DraftConflictError, DraftRejectedError, type DraftApi } from '../DraftApi'
import { DraftSync, SyncStatus } from '../DraftSync'
import type { DraftOp } from '../ops'

const rename = (name: string): DraftOp => ({ op: 'renameNode', nodeId: 'a', name })
const disable = (disabled: boolean): DraftOp => ({ op: 'setDisabled', nodeId: 'a', disabled })

/** Server double: records requests and answers them when told to. */
class FakeApi implements DraftApi {
  readonly requests: Array<{ baseRevision: number; ops: DraftOp[] }> = []
  private revision = 1
  private pending: Array<{ resolve: () => void; reject: (error: Error) => void }> = []
  manual = false
  failNext: Error | null = null

  patch(_workflowId: number, baseRevision: number, ops: DraftOp[]): Promise<{ revision: number }> {
    this.requests.push({ baseRevision, ops })
    return new Promise((resolve, reject) => {
      const answer = () => {
        if (this.failNext) {
          const error = this.failNext
          this.failNext = null
          return reject(error)
        }
        if (baseRevision !== this.revision) return reject(new DraftConflictError('stale'))
        resolve({ revision: ++this.revision })
      }
      if (this.manual) this.pending.push({ resolve: answer, reject })
      else answer()
    })
  }

  answer(): void {
    this.pending.shift()?.resolve()
  }
}

describe('DraftSync', () => {
  let api: FakeApi
  let sync: DraftSync
  let statuses: SyncStatus[]

  beforeEach(() => {
    vi.useFakeTimers()
    api = new FakeApi()
    sync = new DraftSync(api, 7, 1, { debounceMs: 800, retryDelaysMs: [1000, 5000] })
    statuses = []
    sync.events.on('status', (status) => statuses.push(status))
  })

  afterEach(() => vi.useRealTimers())

  it('batches operations within the debounce into one request', async () => {
    sync.enqueue([rename('S')])
    await vi.advanceTimersByTimeAsync(500)
    sync.enqueue([rename('St'), disable(true)])
    expect(api.requests).toHaveLength(0)

    await vi.advanceTimersByTimeAsync(800)
    expect(api.requests).toEqual([{ baseRevision: 1, ops: [rename('St'), disable(true)] }])
    expect(sync.revision).toBe(2)
    expect(statuses).toEqual([SyncStatus.UNSAVED, SyncStatus.SAVING, SyncStatus.SAVED])
  })

  it('sends one request at a time, each on the revision of the previous one', async () => {
    api.manual = true
    sync.enqueue([rename('A')])
    await vi.advanceTimersByTimeAsync(800)
    sync.enqueue([rename('B')])
    await vi.advanceTimersByTimeAsync(800)
    expect(api.requests).toHaveLength(1)

    api.answer()
    await vi.advanceTimersByTimeAsync(800)
    expect(api.requests.map((r) => r.baseRevision)).toEqual([1, 2])
    api.answer()
    await vi.advanceTimersByTimeAsync(0)
    expect(sync.status).toBe(SyncStatus.SAVED)
    expect(sync.hasUnsavedChanges).toBe(false)
  })

  it('flush saves immediately and waits for the server', async () => {
    sync.enqueue([rename('A')])
    await sync.flush()
    expect(api.requests).toHaveLength(1)
    expect(sync.status).toBe(SyncStatus.SAVED)
  })

  it('a conflict keeps the operations and stops saving until reset', async () => {
    api.failNext = new DraftConflictError('changed elsewhere')
    sync.enqueue([rename('A')])
    await vi.advanceTimersByTimeAsync(800)
    expect(sync.status).toBe(SyncStatus.CONFLICT)

    sync.enqueue([rename('B')])
    await vi.advanceTimersByTimeAsync(10_000)
    expect(api.requests).toHaveLength(1)
    expect(sync.hasUnsavedChanges).toBe(true)
    await expect(sync.flush()).rejects.toBeInstanceOf(DraftConflictError)

    sync.reset(5)
    expect(sync.status).toBe(SyncStatus.SAVED)
    expect(sync.hasUnsavedChanges).toBe(false)
  })

  it('rejected operations stop saving without retries', async () => {
    api.failNext = new DraftRejectedError('Operation 1: no node')
    sync.enqueue([rename('A')])
    await vi.advanceTimersByTimeAsync(60_000)
    expect(sync.status).toBe(SyncStatus.FAILED)
    expect(api.requests).toHaveLength(1)
  })

  it('network errors retry with backoff and keep later operations', async () => {
    api.failNext = new Error('Network Error')
    sync.enqueue([rename('A')])
    await vi.advanceTimersByTimeAsync(800)
    expect(sync.status).toBe(SyncStatus.RETRYING)

    sync.enqueue([disable(true)])
    await vi.advanceTimersByTimeAsync(999)
    expect(api.requests).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(api.requests[1]).toEqual({ baseRevision: 1, ops: [rename('A'), disable(true)] })
    expect(sync.status).toBe(SyncStatus.SAVED)
  })

  it('operations made while saving are not lost when the save fails', async () => {
    api.manual = true
    api.failNext = new Error('timeout')
    sync.enqueue([rename('A')])
    await vi.advanceTimersByTimeAsync(800)
    sync.enqueue([rename('B')])
    api.answer()
    await vi.advanceTimersByTimeAsync(0)

    api.manual = false
    await vi.advanceTimersByTimeAsync(1000)
    // Neighbouring renames of the same node collapse to the last one.
    expect(api.requests[1]!.ops).toEqual([rename('B')])
    expect(sync.status).toBe(SyncStatus.SAVED)
  })
})

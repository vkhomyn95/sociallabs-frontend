import { TypedEmitter } from '@/core/workflow/TypedEmitter'
import type { NodeId } from '@/core/workflow/model'
import { ExecutionEventType, ExecutionStatus, NodeRunStatus, type ExecutionDetail, type ExecutionEvent, type RunData } from './types'

/** What the canvas shows on a node for the followed execution. */
export enum NodeRunState {
  RUNNING = 'RUNNING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  SKIPPED = 'SKIPPED',
}

export interface NodeRunView {
  readonly state: NodeRunState
  readonly itemsOut: number
  readonly error: string | null
}

export interface TrackerEvents {
  /** A node's run view changed; null when it was cleared. */
  node: [nodeId: NodeId, view: NodeRunView | null]
  finished: [executionId: number, status: ExecutionStatus, error: string | null]
}

const FROM_RUN_STATUS: Record<NodeRunStatus, NodeRunState> = {
  [NodeRunStatus.SUCCESS]: NodeRunState.SUCCESS,
  [NodeRunStatus.ERROR]: NodeRunState.ERROR,
  [NodeRunStatus.SKIPPED]: NodeRunState.SKIPPED,
}

/**
 * Node states of the one execution the editor follows (the last manual run, or the latest run on open).
 * Live events and stored run data both feed it; events of other executions are ignored, so a busy
 * trigger workflow cannot repaint the canvas.
 */
export class ExecutionTracker {
  readonly events = new TypedEmitter<TrackerEvents>()
  private readonly views = new Map<NodeId, NodeRunView>()
  private followed: number | null = null
  private done = false

  get executionId(): number | null {
    return this.followed
  }

  get running(): boolean {
    return this.followed !== null && !this.done
  }

  view(nodeId: NodeId): NodeRunView | undefined {
    return this.views.get(nodeId)
  }

  /** Follow a new execution; the states of the previous one are cleared. */
  follow(executionId: number): void {
    this.clear()
    this.followed = executionId
    this.done = false
  }

  apply(event: ExecutionEvent): void {
    if (event.executionId !== this.followed || this.done) return
    switch (event.type) {
      case ExecutionEventType.EXECUTION_STARTED:
        return
      case ExecutionEventType.NODE_STARTED:
        if (event.nodeId) this.set(event.nodeId, { state: NodeRunState.RUNNING, itemsOut: 0, error: null })
        return
      case ExecutionEventType.NODE_FINISHED:
        if (event.nodeId) {
          const status = (event.status as NodeRunStatus | null) ?? NodeRunStatus.SUCCESS
          this.set(event.nodeId, { state: FROM_RUN_STATUS[status] ?? NodeRunState.SUCCESS, itemsOut: event.itemsOut ?? 0, error: event.error })
        }
        return
      case ExecutionEventType.EXECUTION_FINISHED:
        this.finish((event.status as ExecutionStatus | null) ?? ExecutionStatus.SUCCESS, event.error)
    }
  }

  /** Mark the followed execution as finished, e.g. when its stream broke and the stored row says so. */
  finish(status: ExecutionStatus, error: string | null = null): void {
    if (this.followed === null || this.done) return
    this.done = true
    // A node still marked running did not report back (canceled or the stream broke).
    for (const [nodeId, view] of this.views) {
      if (view.state === NodeRunState.RUNNING) this.set(nodeId, { ...view, state: NodeRunState.ERROR })
    }
    this.events.emit('finished', this.followed, status, error)
  }

  /** Show a stored execution; replaces whatever was followed before. */
  load(executionId: number, data: RunData): void {
    this.follow(executionId)
    for (const record of Object.values(data.nodes)) {
      this.set(record.nodeId, {
        state: FROM_RUN_STATUS[record.status],
        itemsOut: record.output.reduce((sum, port) => sum + port.length, 0),
        error: record.error,
      })
    }
    this.done = true
  }

  /** Show a stored execution that kept no items: states and counts from its node timeline. */
  loadTimeline(executionId: number, nodes: ExecutionDetail['nodes']): void {
    this.follow(executionId)
    for (const run of nodes) {
      this.set(run.nodeId, { state: FROM_RUN_STATUS[run.status], itemsOut: run.itemsOut, error: run.error })
    }
    this.done = true
  }

  clear(): void {
    const ids = [...this.views.keys()]
    this.views.clear()
    this.followed = null
    ids.forEach((id) => this.events.emit('node', id, null))
  }

  private set(nodeId: NodeId, view: NodeRunView): void {
    this.views.set(nodeId, view)
    this.events.emit('node', nodeId, view)
  }
}

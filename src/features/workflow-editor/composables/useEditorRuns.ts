import { onBeforeUnmount, shallowRef } from 'vue'
import { slbToast } from '@sociallabs/frontend-components'
import { ExecutionTracker } from '@/core/execution/ExecutionTracker'
import { NO_RUN_DATA } from '@/core/execution/RunDataView'
import { ExecutionStatus, type ExecutionDetail, type RunData } from '@/core/execution/types'
import { editorApi } from '../api/editorApi'
import { executionApi } from '../api/executionApi'

const FINAL: ReadonlySet<ExecutionStatus> = new Set([ExecutionStatus.SUCCESS, ExecutionStatus.ERROR, ExecutionStatus.CANCELED])

/** History rows are written in batches shortly after an execution ends; wait for them this long. */
const STORED_RETRIES = 8
const STORED_RETRY_MS = 250
/** How long to poll the history when the event stream of a running execution broke. */
const SETTLE_POLLS = 150
const SETTLE_POLL_MS = 1000

const pause = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Runs of the open workflow as the editor shows them: the latest stored execution on open, and manual
 * runs followed live over SSE. Node states go to the tracker (the canvas listens to it); items arrive as
 * run data once the execution has been stored.
 */
export function useEditorRuns(workflowId: number, onRunningChange: (running: boolean) => void) {
  const tracker = new ExecutionTracker()
  const runData = shallowRef<RunData>(NO_RUN_DATA)
  let closeStream: (() => void) | null = null
  let disposed = false

  const offFinished = tracker.events.on('finished', (executionId, status, error) => {
    closeStream = null
    onRunningChange(false)
    if (status === ExecutionStatus.SUCCESS) slbToast.success(`Execution ${executionId} succeeded`)
    else slbToast.error(`Execution ${executionId}: ${error ?? status.toLowerCase()}`)
    void loadStored(executionId)
  })

  /** Detail of a finished execution; retried while the history write is pending. */
  async function finishedDetail(executionId: number): Promise<ExecutionDetail | null> {
    for (let attempt = 0; attempt < STORED_RETRIES && !disposed; attempt++) {
      try {
        const detail = await executionApi.detail(executionId)
        if (FINAL.has(detail.execution.status)) return detail
      } catch {
        // Not written yet.
      }
      await pause(STORED_RETRY_MS)
    }
    return null
  }

  /** Show the stored items of a finished execution, unless another one was started meanwhile. */
  async function loadStored(executionId: number): Promise<void> {
    const detail = await finishedDetail(executionId)
    if (!detail?.dataAvailable) return
    try {
      const data = await executionApi.data(executionId)
      const current = tracker.executionId
      if (disposed || (current !== null && current !== executionId) || tracker.running) return
      // Stored records are authoritative; they also fill in nodes whose events were missed.
      tracker.load(executionId, data)
      runData.value = data
    } catch {
      // Items were not kept (size limit); the canvas keeps the live states.
    }
  }

  /** Show the latest execution of the workflow, if it kept its items. */
  async function loadLatest(): Promise<void> {
    try {
      const latest = await executionApi.latest(workflowId)
      if (latest && FINAL.has(latest.status)) await loadStored(latest.id)
    } catch {
      // History is optional for editing.
    }
  }

  /** Start the saved draft and follow it until it finishes. */
  async function execute(): Promise<void> {
    if (tracker.running) return
    onRunningChange(true)
    let executionId: number
    try {
      const started = await executionApi.start(workflowId)
      if (!started.executionId) {
        onRunningChange(false)
        slbToast.error(`Execution was not started: ${started.error ?? 'rejected'}`)
        return
      }
      executionId = started.executionId
    } catch (error) {
      onRunningChange(false)
      slbToast.error(`Execution failed: ${editorApi.errorMessage(error)}`)
      return
    }
    runData.value = NO_RUN_DATA
    tracker.follow(executionId)
    closeStream = executionApi.follow(
      executionId,
      (event) => tracker.apply(event),
      () => void settleFromHistory(executionId),
    )
  }

  /** The stream broke before the end: finish from the stored row instead. */
  async function settleFromHistory(executionId: number): Promise<void> {
    for (let poll = 0; poll < SETTLE_POLLS && !disposed && tracker.executionId === executionId && tracker.running; poll++) {
      try {
        const { execution } = await executionApi.detail(executionId)
        if (FINAL.has(execution.status)) {
          tracker.finish(execution.status, execution.errorMessage)
          return
        }
      } catch {
        // Not written yet.
      }
      await pause(SETTLE_POLL_MS)
    }
    if (tracker.executionId === executionId && tracker.running) tracker.finish(ExecutionStatus.CANCELED, 'lost track of the execution')
  }

  onBeforeUnmount(() => {
    disposed = true
    offFinished()
    closeStream?.()
  })

  return { tracker, runData, execute, loadLatest }
}

export type EditorRuns = ReturnType<typeof useEditorRuns>

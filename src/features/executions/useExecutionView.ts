import { computed, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { readOnlyView, type WorkflowView } from '@/core/editor/WorkflowView'
import { ExecutionTracker } from '@/core/execution/ExecutionTracker'
import { NO_RUN_DATA } from '@/core/execution/RunDataView'
import { type ExecutionDetail, type ExecutionWorkflow, type RunData } from '@/core/execution/types'
import { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { toSnapshot } from '@/core/workflow/dto'
import { WorkflowDocument } from '@/core/workflow/WorkflowDocument'
import { editorApi } from '@/features/workflow-editor/api/editorApi'
import { executionApi } from '@/features/workflow-editor/api/executionApi'
import { ExecutionService, UNFINISHED } from '@/stores/execution'

/**
 * One execution shown on the graph it ran on, read-only: node states and items of the stored run, or live
 * states while it is still running. Loads everything once; a different execution is a new instance.
 *
 * @param executionId execution to show
 * @param onFinished  called when a followed execution ends, e.g. to refresh a list
 */
export function useExecutionView(executionId: number, onFinished: () => void = () => {}) {
  const tracker = new ExecutionTracker()
  const view = shallowRef<WorkflowView | null>(null)
  const catalog = shallowRef<NodeTypeCatalog | null>(null)
  const graph = shallowRef<ExecutionWorkflow | null>(null)
  const detail = shallowRef<ExecutionDetail | null>(null)
  const runData = shallowRef<RunData>(NO_RUN_DATA)
  const loadError = ref<string | null>(null)
  let closeStream: (() => void) | null = null
  let disposed = false

  const running = computed(() => detail.value !== null && UNFINISHED.has(detail.value.execution.status))

  /** Nodes that ran but are not in the graph shown: a draft run whose draft changed since. */
  const missingNodes = computed(() => {
    const shown = view.value?.document
    if (!shown || !detail.value) return []
    return detail.value.nodes.map((run) => run.nodeId).filter((id) => !shown.node(id))
  })

  /** Show what is stored: items when kept, otherwise states and counts from the timeline. */
  async function showStored(current: ExecutionDetail): Promise<void> {
    if (current.dataAvailable) {
      try {
        const data = await ExecutionService.data(executionId)
        if (disposed) return
        tracker.load(executionId, data)
        runData.value = data
        return
      } catch {
        // Items were dropped (size limit); the timeline still has the states.
      }
    }
    tracker.loadTimeline(executionId, current.nodes)
  }

  function followLive(): void {
    tracker.follow(executionId)
    const offFinished = tracker.events.on('finished', () => {
      offFinished()
      closeStream = null
      void reloadDetail()
      onFinished()
    })
    closeStream = executionApi.follow(
      executionId,
      (event) => tracker.apply(event),
      () => void reloadDetail(),
    )
  }

  async function reloadDetail(): Promise<void> {
    try {
      const current = await ExecutionService.detail(executionId)
      if (disposed) return
      detail.value = current
      if (!UNFINISHED.has(current.execution.status)) await showStored(current)
    } catch {
      // Keep what is shown; the history row may still be pending.
    }
  }

  async function load(): Promise<void> {
    try {
      const [workflow, current, types] = await Promise.all([
        ExecutionService.workflow(executionId),
        ExecutionService.detail(executionId),
        editorApi.nodeTypes(),
      ])
      if (disposed) return
      catalog.value = new NodeTypeCatalog(types)
      graph.value = workflow
      detail.value = current
      view.value = readOnlyView(workflow.workflowId, new WorkflowDocument(toSnapshot(workflow)))
      if (UNFINISHED.has(current.execution.status)) followLive()
      else await showStored(current)
    } catch (error) {
      loadError.value = editorApi.errorMessage(error)
    }
  }

  onMounted(() => void load())

  onBeforeUnmount(() => {
    disposed = true
    closeStream?.()
  })

  return { tracker, view, catalog, graph, detail, runData, running, missingNodes, loadError }
}

export type ExecutionView = ReturnType<typeof useExecutionView>

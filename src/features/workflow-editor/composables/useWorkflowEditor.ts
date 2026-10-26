import { onBeforeUnmount, onMounted, ref, shallowReactive, shallowRef } from 'vue'
import { slbToast } from '@sociallabs/frontend-components'
import { ConnectRejection, WorkflowEditorSession } from '@/core/editor/WorkflowEditorSession'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { SyncStatus } from '@/core/sync/DraftSync'
import { toSnapshot, type WorkflowDto } from '@/core/workflow/dto'
import type { NodeId, Position } from '@/core/workflow/model'
import { editorApi, httpDraftApi } from '../api/editorApi'
import type { ToolbarState } from '../toolbar/EditorToolbar.vue'
import { useEditorRuns } from './useEditorRuns'

const REJECTIONS: Record<ConnectRejection, string> = {
  [ConnectRejection.SAME_NODE]: 'A node cannot connect to itself',
  [ConnectRejection.DUPLICATE]: 'These ports are already connected',
  [ConnectRejection.CYCLE]: 'This connection would create a loop',
  [ConnectRejection.PORT_KIND]: 'Sub-nodes connect only to the matching input of an agent (model, memory or tools)',
}

/**
 * Vue side of one open workflow: loads it, owns the framework-free session and exposes only the
 * shallow state the page renders (toolbar flags), never the graph itself.
 */
export function useWorkflowEditor(workflowId: number) {
  const session = shallowRef<WorkflowEditorSession | null>(null)
  const catalog = shallowRef<NodeTypeCatalog | null>(null)
  const loadError = ref<string | null>(null)
  const toolbar = shallowReactive<ToolbarState>({
    name: '',
    active: false,
    hasUnpublishedChanges: false,
    status: SyncStatus.SAVED,
    error: null,
    canUndo: false,
    canRedo: false,
    publishing: false,
    executing: false,
  })
  const runs = useEditorRuns(workflowId, (running) => (toolbar.executing = running))
  /** Node open in the node details view. */
  const openNodeId = shallowRef<NodeId | null>(null)
  const unbind: Array<() => void> = []
  let description: string | null = null

  function applyWorkflow(dto: WorkflowDto): void {
    description = dto.description
    toolbar.name = dto.name
    toolbar.active = dto.active
    toolbar.hasUnpublishedChanges = dto.hasUnpublishedChanges ?? true
  }

  function bind(current: WorkflowEditorSession): void {
    const { sync, history } = current
    unbind.push(
      sync.events.on('status', (status) => {
        toolbar.status = status
        toolbar.error = sync.error?.message ?? null
        if (status === SyncStatus.CONFLICT) slbToast.warning('This workflow was changed elsewhere. Reload to continue editing.')
        if (status === SyncStatus.FAILED) slbToast.error(`Changes were not saved: ${sync.error?.message ?? 'rejected by the server'}`)
      }),
      sync.events.on('saved', () => (toolbar.hasUnpublishedChanges = true)),
      history.events.on('changed', () => {
        toolbar.canUndo = history.canUndo
        toolbar.canRedo = history.canRedo
        toolbar.undoLabel = history.undoLabel
        toolbar.redoLabel = history.redoLabel
      }),
    )
  }

  async function load(): Promise<void> {
    try {
      const [dto, types] = await Promise.all([editorApi.load(workflowId), editorApi.nodeTypes()])
      catalog.value = new NodeTypeCatalog(types)
      const current = new WorkflowEditorSession(httpDraftApi, workflowId, dto.revision, toSnapshot(dto))
      bind(current)
      applyWorkflow(dto)
      session.value = current
      void runs.loadLatest()
    } catch (error) {
      loadError.value = editorApi.errorMessage(error)
    }
  }

  /** Save pending changes; @returns false (after telling the user) when they could not be saved */
  async function save(): Promise<boolean> {
    try {
      await session.value?.sync.flush()
      return true
    } catch (error) {
      slbToast.error(`Save failed: ${editorApi.errorMessage(error)}`)
      return false
    }
  }

  async function reload(): Promise<void> {
    const current = session.value
    if (!current) return
    const dto = await editorApi.load(workflowId)
    current.reload(toSnapshot(dto), dto.revision)
    applyWorkflow(dto)
  }

  async function publish(): Promise<void> {
    if (!(await save())) return
    toolbar.publishing = true
    try {
      const result = await editorApi.publish(workflowId)
      toolbar.hasUnpublishedChanges = false
      slbToast.success(result.created ? `Published version ${result.versionNo}` : `Version ${result.versionNo} is already up to date`)
    } catch (error) {
      slbToast.error(`Publish failed: ${editorApi.errorMessage(error)}`)
    } finally {
      toolbar.publishing = false
    }
  }

  async function toggleActive(): Promise<void> {
    if (!(await save())) return
    try {
      applyWorkflow(await editorApi.setActive(workflowId, !toolbar.active))
      slbToast.success(toolbar.active ? 'Workflow activated' : 'Workflow deactivated')
    } catch (error) {
      slbToast.error(editorApi.errorMessage(error))
    }
  }

  async function execute(): Promise<void> {
    if (await save()) await runs.execute()
  }

  async function rename(name: string): Promise<void> {
    try {
      applyWorkflow(await editorApi.rename(workflowId, name, description))
    } catch (error) {
      slbToast.error(`Rename failed: ${editorApi.errorMessage(error)}`)
    }
  }

  function addNode(type: NodeTypeDescriptor, position: Position): void {
    session.value?.addNode(type, position)
  }

  function openNode(nodeId: NodeId): void {
    openNodeId.value = nodeId
  }

  function closeNode(): void {
    openNodeId.value = null
  }

  function onRejected(reason: ConnectRejection): void {
    slbToast.info(REJECTIONS[reason])
  }

  const guardUnload = (event: BeforeUnloadEvent) => {
    if (session.value?.sync.hasUnsavedChanges) event.preventDefault()
  }

  onMounted(() => {
    window.addEventListener('beforeunload', guardUnload)
    void load()
  })

  onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', guardUnload)
    unbind.forEach((off) => off())
    const current = session.value
    // Leaving the page saves what is pending; the session is disposed once that settles.
    void current?.sync.flush().catch(() => undefined).finally(() => current.dispose())
  })

  return {
    session,
    catalog,
    loadError,
    toolbar,
    runs,
    openNodeId,
    undo: () => session.value?.undo(),
    redo: () => session.value?.redo(),
    save,
    reload,
    publish,
    toggleActive,
    execute,
    rename,
    addNode,
    openNode,
    closeNode,
    onRejected,
  }
}

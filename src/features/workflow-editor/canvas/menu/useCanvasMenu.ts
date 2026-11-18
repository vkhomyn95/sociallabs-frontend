import { shallowRef } from 'vue'
import type { GraphNode, NodeMouseEvent } from '@vue-flow/core'
import type { MenuItem } from '@sociallabs/frontend-components'
import type { WorkflowView } from '@/core/editor/WorkflowView'
import { placeAt } from '@/core/workflow/clipboard'
import type { NodeId, Position } from '@/core/workflow/model'
import type { NodeClipboard } from '../../clipboard/useNodeClipboard'
import type { CanvasSelection } from '../useCanvasSelection'
import { actionOf, CanvasMenuAction, canvasMenuItems, type CanvasMenuContext } from './canvasMenu'

/** What the menu needs to open: the context menu component's imperative API. */
export interface ContextMenuHandle {
  openAt(at: MouseEvent | { x: number; y: number }): void
}

/** Canvas actions the menu triggers that live outside the clipboard. */
export interface CanvasMenuHost {
  open(nodeId: NodeId): void
  /** Ask the node creator for a free node at a point. */
  addNodeAt(position: Position): void
}

export interface CanvasMenuDeps {
  readonly view: WorkflowView
  readonly selection: CanvasSelection
  readonly clipboard: NodeClipboard
  readonly host: CanvasMenuHost
  readonly menu: () => ContextMenuHandle | undefined
}

type ActionHandler = (context: CanvasMenuContext) => void

/**
 * Right-click menu of the canvas. A right click on a node that is not selected selects only that node, like in
 * n8n; on a selected node or a selection box the actions apply to the whole selection.
 */
export function useCanvasMenu(deps: CanvasMenuDeps) {
  const { view, selection, clipboard, host } = deps
  const items = shallowRef<MenuItem[]>([])
  let context: CanvasMenuContext = contextFor([])
  /** Flow point where the menu opened: Paste and Add node go there. */
  let point: Position = selection.viewportCentre()

  function contextFor(nodeIds: readonly NodeId[]): CanvasMenuContext {
    const nodes = nodeIds.map((id) => view.document.node(id)).filter((node) => node !== undefined)
    return {
      nodeIds,
      readonly: view.commands === null,
      allDisabled: nodes.length > 0 && nodes.every((node) => node.disabled),
    }
  }

  function show(event: MouseEvent, nodeIds: readonly NodeId[]): void {
    event.preventDefault()
    selection.pointAt({ x: event.clientX, y: event.clientY })
    point = selection.pastePoint()
    context = contextFor(nodeIds)
    items.value = canvasMenuItems(context)
    deps.menu()?.openAt(event)
  }

  function onNodeContextMenu({ event, node }: NodeMouseEvent): void {
    if (!(event instanceof MouseEvent)) return
    const selected = selection.selectedNodeIds()
    if (selected.includes(node.id)) {
      show(event, selected)
      return
    }
    selection.selectOnly([node.id])
    show(event, [node.id])
  }

  function onSelectionContextMenu({ event, nodes }: { event: MouseEvent; nodes: GraphNode[] }): void {
    show(event, nodes.map((node) => node.id))
  }

  function onPaneContextMenu(event: MouseEvent): void {
    show(event, [])
  }

  const handlers: Record<CanvasMenuAction, ActionHandler> = {
    [CanvasMenuAction.OPEN]: ({ nodeIds }) => {
      if (nodeIds[0]) host.open(nodeIds[0])
    },
    [CanvasMenuAction.COPY]: ({ nodeIds }) => void clipboard.copyNodes(nodeIds),
    [CanvasMenuAction.CUT]: ({ nodeIds }) => void clipboard.cutNodes(nodeIds),
    [CanvasMenuAction.PASTE]: () => void clipboard.pasteFromClipboard(placeAt(point)),
    [CanvasMenuAction.DUPLICATE]: ({ nodeIds }) => clipboard.duplicateNodes(nodeIds),
    [CanvasMenuAction.TOGGLE_DISABLED]: ({ nodeIds, allDisabled }) => view.commands?.setDisabled(nodeIds, !allDisabled),
    [CanvasMenuAction.SELECT_ALL]: () => selection.selectAll(),
    [CanvasMenuAction.ADD_NODE]: () => host.addNodeAt(point),
    [CanvasMenuAction.DELETE]: ({ nodeIds }) => view.commands?.remove(nodeIds),
  }

  function onSelect(item: MenuItem): void {
    const action = actionOf(item)
    if (action) handlers[action](context)
  }

  return { items, onNodeContextMenu, onSelectionContextMenu, onPaneContextMenu, onSelect }
}

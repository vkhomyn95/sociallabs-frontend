import { nextTick } from 'vue'
import type { VueFlowStore } from '@vue-flow/core'
import type { NodeId, Position } from '@/core/workflow/model'
import { NODE_SIZE } from './canvasModel'

/** What the clipboard and the context menu need from the canvas, independent of Vue Flow. */
export interface CanvasSelection {
  /** @returns ids of the selected nodes */
  selectedNodeIds(): NodeId[]
  /** @returns keys of the selected connections */
  selectedEdgeIds(): string[]
  /** Make exactly these nodes the selection, e.g. after a paste. */
  selectOnly(ids: readonly NodeId[]): void
  selectAll(): void
  /** @returns where pasted nodes go: the last pointer position over the canvas, else the visible centre */
  pastePoint(): Position
  /** Remember a screen point (e.g. where a context menu opened) as the next paste point. */
  pointAt(screen: { x: number; y: number }): void
  /** @returns centre of the visible area in flow coordinates, as the top-left corner of a node */
  viewportCentre(): Position
}

/**
 * Selection and pointer tracking of one Vue Flow canvas.
 *
 * @param flow the canvas store
 * @returns the selection port and the pane listeners that keep the pointer position
 */
export function useCanvasSelection(flow: VueFlowStore) {
  let pointer: Position | null = null

  const toFlow = (screen: { x: number; y: number }): Position => flow.screenToFlowCoordinate(screen)

  function viewportCentre(): Position {
    const { x, y, zoom } = flow.viewport.value
    const { width, height } = flow.dimensions.value
    return { x: (width / 2 - x) / zoom - NODE_SIZE / 2, y: (height / 2 - y) / zoom - NODE_SIZE / 2 }
  }

  /** New nodes reach Vue Flow through the projection, so they are selected once they are rendered. */
  function selectOnly(ids: readonly NodeId[]): void {
    flow.removeSelectedElements()
    void nextTick(() => {
      const nodes = ids.map((id) => flow.findNode(id)).filter((node) => node !== undefined)
      flow.addSelectedNodes(nodes)
    })
  }

  const selection: CanvasSelection = {
    selectedNodeIds: () => flow.getSelectedNodes.value.map((node) => node.id),
    selectedEdgeIds: () => flow.getSelectedEdges.value.map((edge) => edge.id),
    selectOnly,
    selectAll: () => flow.addSelectedNodes(flow.getNodes.value),
    pastePoint: () => pointer ?? viewportCentre(),
    pointAt: (screen) => (pointer = toFlow(screen)),
    viewportCentre,
  }

  /** Pointer left the pane: a later paste goes to the visible centre, like a paste from outside the canvas. */
  const forgetPointer = (): void => {
    pointer = null
  }

  const trackPointer = (event: MouseEvent): void => selection.pointAt({ x: event.clientX, y: event.clientY })

  return { selection, trackPointer, forgetPointer }
}

import type { NodeInstance } from '@/stores/node/types'

/**
 * Every node panel receives these props and emits these events.
 * The NodeEditorModal doesn't know which concrete panel it hosts —
 * it only deals with this contract.
 */
export interface NodePanelProps {
  node: NodeInstance
  /** JSON data from the left-side input inspector; used for {{$json.x}} hints */
  inputData?: Record<string, unknown>[]
}

export interface NodePanelEmits {
  /** Partial update — panel pushes live changes without closing */
  (e: 'update', node: NodeInstance): void
  /** User clicked Save — close the modal */
  (e: 'save', node: NodeInstance): void
  /** User clicked Cancel */
  (e: 'close'): void
}

/**
 * Composable that panels call to get shared utilities:
 *   deepClone, emitUpdate, emitSave
 */
export function useNodePanel(
  props: NodePanelProps,
  emit: (event: string, ...args: unknown[]) => void
) {
  function clone<T>(v: T): T {
    return JSON.parse(JSON.stringify(v))
  }

  function emitUpdate(node: NodeInstance) {
    emit('update', clone(node))
  }

  function emitSave(node: NodeInstance) {
    emit('save', clone(node))
  }

  function emitClose() {
    emit('close')
  }

  /** Reactive local copy of node; mutate freely, call emitUpdate() after */
  const localNode = clone(props.node) as NodeInstance

  return { localNode, clone, emitUpdate, emitSave, emitClose }
}

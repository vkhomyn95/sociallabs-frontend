import { onBeforeUnmount, shallowRef, type ShallowRef } from 'vue'
import type { NodeId, NodeModel } from '@/core/workflow/model'
import type { WorkflowDocument } from '@/core/workflow/WorkflowDocument'

/**
 * The current model of one node, following the document (edits, undo, reload). Calls `onGone` when the
 * node disappears, e.g. when adding it is undone.
 */
export function useOpenNode(doc: WorkflowDocument, nodeId: NodeId, onGone: () => void): ShallowRef<NodeModel | undefined> {
  const node = shallowRef(doc.node(nodeId))
  const sync = () => {
    node.value = doc.node(nodeId)
    if (!node.value) onGone()
  }
  const offs = [
    doc.events.on('nodeChanged', (changed) => {
      if (changed.id === nodeId) node.value = changed
    }),
    doc.events.on('nodeRemoved', (removed) => {
      if (removed.id === nodeId) sync()
    }),
    doc.events.on('loaded', sync),
  ]
  onBeforeUnmount(() => offs.forEach((off) => off()))
  return node
}

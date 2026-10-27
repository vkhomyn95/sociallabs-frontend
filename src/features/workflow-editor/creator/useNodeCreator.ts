import { ref, shallowRef } from 'vue'
import type { WorkflowView } from '@/core/editor/WorkflowView'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { typeKeyOf, type NodeModel } from '@/core/workflow/model'
import type { NodeItem } from './creatorModel'
import { linkOf, type InsertTarget } from './insertTarget'

/**
 * Open state of the node creator and what choosing an entry does: add the node at the target with the entry's
 * preset, wired to the port it was opened from, in one undo step.
 *
 * @param view    the open workflow; read-only views never open the creator
 * @param catalog node types, to tell whether the workflow has a trigger yet
 */
export function useNodeCreator(view: () => WorkflowView | null, catalog: () => NodeTypeCatalog | null) {
  /** Where the next node goes; null while the creator is closed. */
  const target = shallowRef<InsertTarget | null>(null)
  const hasTrigger = ref(false)

  function open(next: InsertTarget): void {
    const current = view()
    const types = catalog()
    if (!current?.commands || !types) return
    hasTrigger.value = current.document.nodes().some((node) => types.isTrigger(typeKeyOf(node)))
    target.value = next
  }

  function close(): void {
    target.value = null
  }

  /** @returns the added node, null when the creator was not open on an editable workflow */
  function insert(item: NodeItem): NodeModel | null {
    const commands = view()?.commands
    const at = target.value
    if (!commands || !at) return null
    close()
    return commands.insertNode(item.type, at.position, { parameters: item.parameters, link: linkOf(at) })
  }

  return { target, hasTrigger, open, close, insert }
}

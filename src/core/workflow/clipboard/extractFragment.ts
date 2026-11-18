import type { NodeId } from '../model'
import type { WorkflowDocument } from '../WorkflowDocument'
import { createFragment, type WorkflowFragment } from './WorkflowFragment'

/**
 * Copy the given nodes out of a document with the connections between them; connections that leave the
 * selection are dropped, like in n8n.
 *
 * @param doc document to copy from
 * @param ids selected nodes; unknown ids are ignored
 * @returns the fragment, or null when none of the ids is a node of the document
 */
export function extractFragment(doc: WorkflowDocument, ids: readonly NodeId[]): WorkflowFragment | null {
  const nodes = ids.map((id) => doc.node(id)).filter((node) => node !== undefined)
  if (!nodes.length) return null
  const selected = new Set(nodes.map((node) => node.id))
  const connections = doc
    .connections()
    .filter((connection) => selected.has(connection.source) && selected.has(connection.target))
  return createFragment(nodes, connections)
}

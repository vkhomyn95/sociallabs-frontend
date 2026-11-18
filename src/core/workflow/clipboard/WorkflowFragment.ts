import type { ConnectionModel, NodeModel } from '../model'

/** Marks clipboard text as a piece of a SocialLabs workflow, so foreign JSON is never pasted as nodes. */
export const FRAGMENT_FORMAT = 'sociallabs/workflow-fragment'

/** Bumped when the shape changes incompatibly; older payloads are rejected, not guessed at. */
export const FRAGMENT_VERSION = 1

/**
 * Nodes copied from a workflow together with the connections among them. Connections to nodes outside the
 * fragment are never part of it, so a fragment is a self-contained subgraph.
 */
export interface WorkflowFragment {
  readonly format: typeof FRAGMENT_FORMAT
  readonly version: typeof FRAGMENT_VERSION
  readonly nodes: readonly NodeModel[]
  readonly connections: readonly ConnectionModel[]
}

/**
 * @param nodes       nodes of the fragment
 * @param connections connections among them
 * @returns fragment with the current format marker
 */
export function createFragment(nodes: readonly NodeModel[], connections: readonly ConnectionModel[]): WorkflowFragment {
  return { format: FRAGMENT_FORMAT, version: FRAGMENT_VERSION, nodes, connections }
}

/**
 * Keep only the nodes that pass the filter and the connections whose both ends are kept.
 *
 * @param fragment source fragment
 * @param keep     whether a node stays, e.g. its type is known to this editor
 * @returns filtered fragment, the same instance when nothing was dropped
 */
export function filterFragment(fragment: WorkflowFragment, keep: (node: NodeModel) => boolean): WorkflowFragment {
  const nodes = fragment.nodes.filter(keep)
  if (nodes.length === fragment.nodes.length) return fragment
  const ids = new Set(nodes.map((node) => node.id))
  const connections = fragment.connections.filter((connection) => ids.has(connection.source) && ids.has(connection.target))
  return createFragment(nodes, connections)
}

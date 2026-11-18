import type { ConnectionModel, NodeId } from './model'
import type { WorkflowDocument } from './WorkflowDocument'

/**
 * @param doc        document
 * @param connection candidate connection
 * @returns whether adding the connection would close a cycle (the engine runs DAGs only)
 */
export function wouldCreateCycle(doc: WorkflowDocument, connection: Pick<ConnectionModel, 'source' | 'target'>): boolean {
  if (connection.source === connection.target) return true
  const stack: NodeId[] = [connection.target]
  const seen = new Set<NodeId>()
  while (stack.length) {
    const id = stack.pop()!
    if (id === connection.source) return true
    if (seen.has(id)) continue
    seen.add(id)
    doc.outgoing(id).forEach((next) => stack.push(next.target))
  }
  return false
}

/** @returns ids of all nodes the node reads from, nearest first */
export function upstreamOf(doc: WorkflowDocument, id: NodeId): NodeId[] {
  const result: NodeId[] = []
  const seen = new Set<NodeId>([id])
  let frontier = [id]
  while (frontier.length) {
    const next: NodeId[] = []
    frontier.forEach((current) =>
      doc.incoming(current).forEach(({ source }) => {
        if (seen.has(source)) return
        seen.add(source)
        result.push(source)
        next.push(source)
      }),
    )
    frontier = next
  }
  return result
}

/**
 * @param doc  document
 * @param base preferred name
 * @returns the name, or the name with the lowest free numeric suffix (`HTTP Request 2`)
 */
export function uniqueNodeName(doc: WorkflowDocument, base: string): string {
  return uniqueName(takenNodeNames(doc), base)
}

/** @returns names of all nodes of the document */
export function takenNodeNames(doc: WorkflowDocument): Set<string> {
  return new Set(doc.nodes().map((node) => node.name))
}

/** Numeric suffix a generated name ends with, e.g. the ` 2` of `HTTP Request 2`. */
const NUMBER_SUFFIX = / \d+$/

/**
 * A copy of `HTTP Request 2` becomes `HTTP Request 3`, not `HTTP Request 2 2`: an existing suffix is replaced.
 *
 * @param taken names already in use
 * @param base  preferred name
 * @returns the name, or the name with the lowest free numeric suffix (`HTTP Request 2`)
 */
export function uniqueName(taken: ReadonlySet<string>, base: string): string {
  if (!taken.has(base)) return base
  const stem = base.replace(NUMBER_SUFFIX, '') || base
  let n = 2
  while (taken.has(`${stem} ${n}`)) n++
  return `${stem} ${n}`
}

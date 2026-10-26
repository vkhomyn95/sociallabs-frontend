import type { DraftOp } from './ops'

type Merge = (previous: DraftOp, next: DraftOp) => DraftOp | null

/** A later set of the same node field replaces the earlier one. */
const sameNodeField: Merge = (previous, next) =>
  previous.op === next.op && 'nodeId' in previous && 'nodeId' in next && previous.nodeId === next.nodeId ? next : null

const MERGES: Partial<Record<DraftOp['op'], Merge>> = {
  moveNodes: (previous, next) =>
    previous.op === 'moveNodes' && next.op === 'moveNodes'
      ? { op: 'moveNodes', positions: { ...previous.positions, ...next.positions } }
      : null,
  renameNode: sameNodeField,
  setParameters: sameNodeField,
  setCredential: sameNodeField,
  setDisabled: sameNodeField,
  setNotes: sameNodeField,
  setSettings: sameNodeField,
}

/**
 * Merge adjacent operations that overwrite each other, so typing into a field or nudging a node sends one
 * operation. Only neighbours are merged, which keeps the result equivalent to applying the input in order.
 *
 * @param ops operations in order
 * @returns equivalent, shorter list
 */
export function compactOps(ops: readonly DraftOp[]): DraftOp[] {
  const result: DraftOp[] = []
  for (const op of ops) {
    const last = result[result.length - 1]
    const merged = last ? MERGES[op.op]?.(last, op) : null
    if (merged) result[result.length - 1] = merged
    else result.push(op)
  }
  return result
}

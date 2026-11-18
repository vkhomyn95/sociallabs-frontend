import type { NodeModel, Position } from '../model'

/** How far a duplicate or a paste without a target point is shifted from the original, like in n8n. */
export const PASTE_OFFSET: Position = { x: 40, y: 40 }

/** Where the pasted nodes go; their layout relative to each other never changes. */
export type Placement =
  /** The top-left corner of the pasted nodes lands on the point (the pointer or the visible centre). */
  | { readonly kind: 'at'; readonly point: Position }
  /** Every node is shifted by the offset from where it was copied. */
  | { readonly kind: 'shift'; readonly offset: Position }

export const placeAt = (point: Position): Placement => ({ kind: 'at', point })

export const shiftBy = (offset: Position = PASTE_OFFSET): Placement => ({ kind: 'shift', offset })

/** @returns top-left corner of the nodes' positions */
function topLeft(nodes: readonly NodeModel[]): Position {
  return {
    x: Math.min(...nodes.map((node) => node.position.x)),
    y: Math.min(...nodes.map((node) => node.position.y)),
  }
}

/**
 * @param nodes     nodes being pasted, at their copied positions
 * @param placement where they go
 * @returns translation to add to every position
 */
export function translationFor(nodes: readonly NodeModel[], placement: Placement): Position {
  switch (placement.kind) {
    case 'shift':
      return placement.offset
    case 'at': {
      if (!nodes.length) return { x: 0, y: 0 }
      const corner = topLeft(nodes)
      return { x: placement.point.x - corner.x, y: placement.point.y - corner.y }
    }
  }
}

/** @returns the position moved by the translation */
export function translate(position: Position, by: Position): Position {
  return { x: position.x + by.x, y: position.y + by.y }
}

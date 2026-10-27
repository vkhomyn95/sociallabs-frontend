import { getBezierPath, getSmoothStepPath, Position } from '@vue-flow/core'

/** Where an edge starts and ends, as Vue Flow hands it to edges and to the connection line. */
export interface EdgeEnds {
  readonly sourceX: number
  readonly sourceY: number
  readonly sourcePosition: Position
  readonly targetX: number
  readonly targetY: number
  readonly targetPosition: Position
}

/** One SVG path of an edge. */
export interface EdgeSegment {
  readonly path: string
}

export interface EdgePath {
  /** One bezier, or two rounded steps for an edge running back. */
  readonly segments: readonly EdgeSegment[]
  /** Where the label and the remove button sit. */
  readonly labelX: number
  readonly labelY: number
}

export interface EdgePathOptions {
  readonly shape?: EdgeShape
  /**
   * Lowest point of the nodes the edge joins, labels included. A backward edge passes below it, so it does not
   * cut through a target that sits lower than the source.
   */
  readonly floorY?: number
}

export enum EdgeShape {
  /** Plain curve: forward edges, sub-node attachments, connections dragged from an input. */
  BEZIER = 'BEZIER',
  /** Pick by direction: a curve forward, a detour below the source when the target lies behind it. */
  AUTO = 'AUTO',
}

/** How far below the source handle a backward edge runs, clear of the card and its name. */
const DETOUR_BELOW = 130
/** Straight run out of the source and into the target before a backward edge turns. */
const DETOUR_OFFSET = 40
const CORNER_RADIUS = 16
/** Gap between the lowest node and a backward edge running under it. */
const FLOOR_GAP = 24
/** Slack before an edge counts as backward, so it does not flip while the drag starts at the handle. */
const HANDLE_SLACK = 20

/** The target is behind the source handle: a curve would cut across the source card. */
export const runsBackward = (ends: EdgeEnds): boolean => ends.sourceX - HANDLE_SLACK > ends.targetX

/**
 * Path of a canvas edge, the way n8n draws them: a bezier while the target is ahead of the source, and for an
 * edge back to an earlier node two rounded steps that leave the source to the right, pass below it and enter the
 * target from the left. Unlike n8n the detour also passes below the target when that one sits lower. Other nodes
 * are not avoided; edges cross them, as in n8n.
 */
export function edgePath(ends: EdgeEnds, { shape = EdgeShape.AUTO, floorY }: EdgePathOptions = {}): EdgePath {
  if (shape === EdgeShape.BEZIER || !runsBackward(ends)) {
    const [path, labelX, labelY] = getBezierPath(ends)
    return { segments: [{ path }], labelX, labelY }
  }
  const turnX = (ends.sourceX + ends.targetX) / 2
  const turnY = Math.max(ends.sourceY + DETOUR_BELOW, (floorY ?? -Infinity) + FLOOR_GAP)
  const [out] = getSmoothStepPath({
    sourceX: ends.sourceX,
    sourceY: ends.sourceY,
    sourcePosition: ends.sourcePosition,
    targetX: turnX,
    targetY: turnY,
    targetPosition: Position.Right,
    borderRadius: CORNER_RADIUS,
    offset: DETOUR_OFFSET,
  })
  const [back] = getSmoothStepPath({
    sourceX: turnX,
    sourceY: turnY,
    sourcePosition: Position.Left,
    targetX: ends.targetX,
    targetY: ends.targetY,
    targetPosition: ends.targetPosition,
    borderRadius: CORNER_RADIUS,
    offset: DETOUR_OFFSET,
  })
  return { segments: [{ path: out }, { path: back }], labelX: turnX, labelY: turnY }
}

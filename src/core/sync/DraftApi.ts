import type { DraftOp } from './ops'

/** Port to the server's draft endpoint; the HTTP adapter lives outside src/core. */
export interface DraftApi {
  /**
   * @returns new draft revision
   * @throws DraftConflictError when the draft moved past `baseRevision`
   * @throws DraftRejectedError when the server refused the operations; resending them cannot succeed
   */
  patch(workflowId: number, baseRevision: number, ops: DraftOp[]): Promise<{ revision: number }>
}

/** The draft was changed elsewhere (another tab or user); the editor must reload before saving. */
export class DraftConflictError extends Error {}

/** The server refused the operations as invalid; usually a client bug or a stale node type. */
export class DraftRejectedError extends Error {}

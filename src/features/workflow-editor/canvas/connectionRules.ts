import { ConnectRejection } from '@/core/editor/WorkflowEditorSession'
import { connectionTypeFor } from '@/core/node-types/ports'
import type { ConnectionType, NodeId } from '@/core/workflow/model'
import { handleIndex, isInputHandle, isOutputHandle, type CanvasNodeData } from './canvasModel'

/** A connection gesture as Vue Flow reports it: node ids and handle ids. */
export interface HandleConnection {
  readonly source: string
  readonly sourceHandle?: string | null
  readonly target: string
  readonly targetHandle?: string | null
}

export type ConnectionCheck =
  | { readonly valid: true; readonly sourceOutput: number; readonly targetInput: number; readonly type: ConnectionType }
  | { readonly valid: false; readonly rejection: ConnectRejection }

/**
 * Whether a dragged connection joins an existing output to an existing input of a matching kind. Duplicates and
 * loops are the session's to judge, since they depend on the whole document.
 *
 * @param connection the gesture
 * @param dataOf     what the canvas draws for a node
 */
export function checkConnection(connection: HandleConnection, dataOf: (id: NodeId) => CanvasNodeData | undefined): ConnectionCheck {
  if (!isOutputHandle(connection.sourceHandle) || !isInputHandle(connection.targetHandle)) {
    return { valid: false, rejection: ConnectRejection.NO_PORT }
  }
  const sourceOutput = handleIndex(connection.sourceHandle)
  const targetInput = handleIndex(connection.targetHandle)
  const sourcePort = dataOf(connection.source)?.outputs.find((port) => port.index === sourceOutput)
  const targetPort = dataOf(connection.target)?.inputs.find((port) => port.index === targetInput)
  if (!sourcePort || !targetPort) return { valid: false, rejection: ConnectRejection.NO_PORT }
  const type = connectionTypeFor(sourcePort, targetPort)
  return type ? { valid: true, sourceOutput, targetInput, type } : { valid: false, rejection: ConnectRejection.PORT_KIND }
}

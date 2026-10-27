import { describe, expect, it } from 'vitest'
import { ConnectRejection } from '@/core/editor/WorkflowEditorSession'
import { PortKind } from '@/core/node-types/descriptor'
import { PortRole, type PortView } from '@/core/node-types/ports'
import { ConnectionType } from '@/core/workflow/model'
import type { CanvasNodeData } from '../canvasModel'
import { checkConnection } from '../connectionRules'

const port = (index: number, kind = PortKind.MAIN): PortView => ({ index, label: '', kind, role: PortRole.DEFAULT })
const nodeData = (inputs: PortView[], outputs: PortView[]) => ({ inputs, outputs }) as unknown as CanvasNodeData

const NODES: Record<string, CanvasNodeData> = {
  action: nodeData([port(0)], [port(0)]),
  trigger: nodeData([], [port(0)]),
  agent: nodeData([port(0), port(1, PortKind.AI_MODEL)], [port(0)]),
  model: nodeData([], [port(0, PortKind.AI_MODEL)]),
}
const dataOf = (id: string) => NODES[id]

describe('checkConnection', () => {
  it('accepts an output into a matching input', () => {
    expect(checkConnection({ source: 'trigger', sourceHandle: 'out-0', target: 'action', targetHandle: 'in-0' }, dataOf)).toEqual({
      valid: true,
      sourceOutput: 0,
      targetInput: 0,
      type: ConnectionType.MAIN,
    })
  })

  it('rejects an output dropped on another output, and anything into a trigger', () => {
    expect(checkConnection({ source: 'agent', sourceHandle: 'out-0', target: 'trigger', targetHandle: 'out-0' }, dataOf)).toEqual({
      valid: false,
      rejection: ConnectRejection.NO_PORT,
    })
    expect(checkConnection({ source: 'agent', sourceHandle: 'out-0', target: 'trigger', targetHandle: 'in-0' }, dataOf)).toEqual({
      valid: false,
      rejection: ConnectRejection.NO_PORT,
    })
  })

  it('rejects a sub-node into a main input', () => {
    expect(checkConnection({ source: 'model', sourceHandle: 'out-0', target: 'agent', targetHandle: 'in-0' }, dataOf)).toEqual({
      valid: false,
      rejection: ConnectRejection.PORT_KIND,
    })
  })
})

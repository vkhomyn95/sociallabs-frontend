import { ConnectionType, type ConnectionModel, type NodeModel } from '../model'

export const node = (id: string, changes: Partial<NodeModel> = {}): NodeModel => ({
  id,
  name: id,
  type: 'core.if',
  typeVersion: 1,
  position: { x: 0, y: 0 },
  parameters: {},
  credentialId: null,
  disabled: false,
  notes: null,
  settings: null,
  ...changes,
})

export const link = (source: string, target: string, sourceOutput = 0, targetInput = 0): ConnectionModel => ({
  source,
  sourceOutput,
  target,
  targetInput,
  type: ConnectionType.MAIN,
})

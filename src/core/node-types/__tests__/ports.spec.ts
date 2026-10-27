import { describe, expect, it } from 'vitest'
import { OnError } from '@/core/workflow/model'
import { NodeGroup, NodeKind, NodeTypeStatus, PortKind, type NodeTypeDescriptor } from '../descriptor'
import { NodeTypeCatalog } from '../NodeTypeCatalog'
import { outputPorts, PortRole } from '../ports'

const type = (changes: Partial<NodeTypeDescriptor>): NodeTypeDescriptor => ({
  key: 'core.if@1',
  name: 'core.if',
  version: 1,
  kind: NodeKind.ACTION,
  displayName: 'If',
  description: '',
  group: NodeGroup.LOGIC,
  icon: '',
  status: NodeTypeStatus.STABLE,
  inputs: [{ name: 'main', displayName: '', kind: PortKind.MAIN }],
  outputs: [
    { name: 'true', displayName: 'true', kind: PortKind.MAIN },
    { name: 'false', displayName: 'false', kind: PortKind.MAIN },
  ],
  credentials: { types: [], required: false },
  properties: [],
  ...changes,
})

describe('outputPorts', () => {
  it('static outputs, plus the error port when failures are routed to it', () => {
    expect(outputPorts(type({}), { parameters: {}, settings: null }).map((p) => p.label)).toEqual(['true', 'false'])
    const routed = outputPorts(type({}), {
      parameters: {},
      settings: { onError: OnError.ERROR_OUTPUT, alwaysOutputData: false, executeOnce: false },
    })
    expect(routed.at(-1)).toMatchObject({ index: 2, role: PortRole.ERROR })
  })

  it('one port per rule plus fallback for dynamic outputs', () => {
    const switchType = type({ outputs: [], dynamicOutputs: { parameter: 'rules', labelField: 'outputName', fallback: true } })
    const ports = outputPorts(switchType, { parameters: { rules: [{ outputName: 'vip' }, {}] }, settings: null })
    expect(ports.map((p) => [p.index, p.label, p.role])).toEqual([
      [0, 'vip', PortRole.DEFAULT],
      [1, 'output 2', PortRole.DEFAULT],
      [2, 'fallback', PortRole.FALLBACK],
    ])
    expect(outputPorts(switchType, { parameters: { rules: 'broken' }, settings: null })).toHaveLength(1)
  })
})

describe('NodeTypeCatalog', () => {
  it('looks types up by key and tells triggers', () => {
    const catalog = new NodeTypeCatalog([
      type({ key: 'b@1', displayName: 'Webhook', group: NodeGroup.CORE, kind: NodeKind.TRIGGER }),
      type({ key: 'a@1', displayName: 'If', group: NodeGroup.LOGIC }),
    ])
    expect(catalog.get('a@1')?.displayName).toBe('If')
    expect(catalog.isTrigger('b@1')).toBe(true)
    expect(catalog.isTrigger('a@1')).toBe(false)
  })
})

describe('connectionTypeFor', () => {
  it('connects main to main and sub-nodes only to inputs of their kind', async () => {
    const { connectionTypeFor } = await import('../ports')
    const { ConnectionType } = await import('@/core/workflow/model')
    expect(connectionTypeFor({ kind: PortKind.MAIN }, { kind: PortKind.MAIN })).toBe(ConnectionType.MAIN)
    expect(connectionTypeFor({ kind: PortKind.AI_TOOL }, { kind: PortKind.AI_TOOL })).toBe(ConnectionType.AI_TOOL)
    expect(connectionTypeFor({ kind: PortKind.AI_MODEL }, { kind: PortKind.AI_TOOL })).toBeNull()
    expect(connectionTypeFor({ kind: PortKind.AI_MODEL }, { kind: PortKind.MAIN })).toBeNull()
  })
})

import { NodeGroup, NodeKind, NodeTypeStatus, PortKind, PropertyType, type NodeTypeDescriptor, type PropertyDescriptor } from '../descriptor'

export const property = (name: string, changes: Partial<PropertyDescriptor> = {}): PropertyDescriptor => ({
  name,
  displayName: name[0]!.toUpperCase() + name.slice(1),
  description: '',
  placeholder: '',
  type: PropertyType.STRING,
  required: false,
  expression: true,
  options: [],
  children: [],
  show: [],
  hide: [],
  ...changes,
})

export const option = (value: string) => ({ value, displayName: value, description: '' })

export const nodeType = (changes: Partial<NodeTypeDescriptor> = {}): NodeTypeDescriptor => ({
  key: 'test.node@1',
  name: 'test.node',
  version: 1,
  kind: NodeKind.ACTION,
  displayName: 'Test node',
  description: '',
  group: NodeGroup.CORE,
  icon: '',
  status: NodeTypeStatus.STABLE,
  inputs: [{ name: 'main', displayName: '', kind: PortKind.MAIN }],
  outputs: [{ name: 'main', displayName: '', kind: PortKind.MAIN }],
  credentials: { types: [], required: false },
  properties: [],
  ...changes,
})

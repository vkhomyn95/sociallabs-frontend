/** Node type descriptors served by `GET /api/v1/node-types`; mirror the backend SDK descriptor enums. */

export enum NodeKind {
  ACTION = 'ACTION',
  TRIGGER = 'TRIGGER',
}

export enum NodeGroup {
  CORE = 'CORE',
  LOGIC = 'LOGIC',
  DATA = 'DATA',
  COMMUNICATION = 'COMMUNICATION',
  AI = 'AI',
}

export enum NodeTypeStatus {
  STABLE = 'STABLE',
  /** Listed but not runnable yet. */
  PREVIEW = 'PREVIEW',
  DEPRECATED = 'DEPRECATED',
}

export enum PortKind {
  MAIN = 'MAIN',
  AI_MODEL = 'AI_MODEL',
  AI_MEMORY = 'AI_MEMORY',
  AI_TOOL = 'AI_TOOL',
}

export enum PropertyType {
  AUTO = 'AUTO',
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  OPTIONS = 'OPTIONS',
  MULTI_OPTIONS = 'MULTI_OPTIONS',
  COLLECTION = 'COLLECTION',
  FIXED_COLLECTION = 'FIXED_COLLECTION',
  JSON = 'JSON',
}

export interface PortDescriptor {
  name: string
  displayName: string
  kind: PortKind
}

export interface PropertyOption {
  value: string
  displayName: string
  description: string
}

export interface DisplayCondition {
  field: string
  values: string[]
}

export interface PropertyDescriptor {
  name: string
  displayName: string
  description: string
  placeholder: string
  type: PropertyType
  required: boolean
  defaultValue?: unknown
  expression: boolean
  options: PropertyOption[]
  children: PropertyDescriptor[]
  show: DisplayCondition[]
  hide: DisplayCondition[]
}

/** Outputs generated from a list parameter, one port per element plus an optional fallback port. */
export interface DynamicOutputsDescriptor {
  parameter: string
  /** Element field used as the port label, empty for index labels. */
  labelField: string
  fallback: boolean
}

export interface NodeTypeDescriptor {
  /** `name@version` */
  key: string
  name: string
  version: number
  kind: NodeKind
  displayName: string
  description: string
  group: NodeGroup
  icon: string
  status: NodeTypeStatus
  inputs: PortDescriptor[]
  outputs: PortDescriptor[]
  dynamicOutputs?: DynamicOutputsDescriptor | null
  credentials: { types: string[]; required: boolean }
  properties: PropertyDescriptor[]
}

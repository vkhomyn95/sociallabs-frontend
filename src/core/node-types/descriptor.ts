/** Node type descriptors served by `GET /api/v1/node-types`; mirror the backend SDK descriptor enums. */

export enum NodeKind {
  ACTION = 'ACTION',
  TRIGGER = 'TRIGGER',
  /** Sub-node (chat model, memory, tool) attached to another node's sub-node input; never runs with items. */
  SUPPLY = 'SUPPLY',
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
  /** Several texts (ids, file references), edited as tags. */
  STRING_LIST = 'STRING_LIST',
  COLLECTION = 'COLLECTION',
  FIXED_COLLECTION = 'FIXED_COLLECTION',
  JSON = 'JSON',
}

export interface PortDescriptor {
  name: string
  displayName: string
  kind: PortKind
  /** Conditions on top-level parameters for showing the port; empty for always. */
  show: DisplayCondition[]
}

export interface PropertyOption {
  value: string
  displayName: string
  description: string
  /** Heading the option is listed under, empty for none; see `PropertyDescriptor.optionsFilteredBy`. */
  group: string
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
  /** Choices are loaded from the server while editing (e.g. the models of an API key); any text is still allowed. */
  loadOptions: boolean
  /**
   * Sibling whose value selects the choices offered: only options whose `group` equals it, e.g. the operations of the
   * chosen resource. Empty when every option is offered.
   */
  optionsFilteredBy: string
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

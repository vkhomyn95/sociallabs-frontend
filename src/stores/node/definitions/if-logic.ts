import {
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types'

export const IfNodeDefinition: NodeDefinition = {
  executor: NodeDiscriminator.IF_LOGIC,
  type: NodeType.LOGIC,
  category: NodeCategory.LOGIC,
  name: 'IF',
  description: 'Route items based on conditions',
  requiresCredentials: false,
  supportsMultipleItems: true,

  // Оголошуємо multiple outputs
  parameters: [
    {
      name: 'combineOperation',
      displayName: 'Combine Conditions',
      type: ParameterType.OPTIONS,
      required: true,
      default: IfCombineLogicOperation.AND,
      options: [
        { value: IfCombineLogicOperation.AND, name: 'AND — all conditions must match' },
        { value: IfCombineLogicOperation.OR,  name: 'OR — any condition must match' }
      ]
    },
    {
      name: 'conditions',
      displayName: 'Conditions',
      type: ParameterType.CONDITIONS, // спеціальний тип
      required: true,
      default: [] as IfLogicGroup[]
    }
  ],

  outputs: {
    true:  { name: 'true',  displayName: 'True',  type: 'object', description: 'Items matching condition' },
    false: { name: 'false', displayName: 'False', type: 'object', description: 'Items not matching' }
  }
}

export enum IfCombineLogicOperation {
  AND = 'AND',
  OR = 'OR'
}

export interface IfLogicGroup {
  leftValue: string,
  operation: LogicOperation,
  rightValue: string,
  type: string
}

export enum LogicOperation {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  IS_EMPTY = 'IS_EMPTY',
  IS_NOT_EMPTY = 'IS_NOT_EMPTY',
  GT = 'GT',
  LT = 'LT',
  GTE = 'GTE',
  LTE = 'LTE',
  REGEX = 'REGEX',
  IS_TRUE = 'IS_TRUE',
  IS_FALSE = 'IS_FALSE',
}

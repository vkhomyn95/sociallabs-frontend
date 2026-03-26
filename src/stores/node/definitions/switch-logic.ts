import {
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types'
import type { LogicOperation } from '@/stores/node/definitions/if-logic.ts'

export enum SwitchLogicMode {
  RULES      = 'RULES',
  EXPRESSION = 'EXPRESSION',
}

export interface SwitchCondition {
  leftValue:        string
  operation:        LogicOperation
  rightValue:       string
  type:             'STRING' | 'NUMBER' | 'BOOLEAN'
}

/**
 * Одне правило Switch ноди.
 * outputIndex — індекс вихідного порту (0, 1, 2...).
 * conditions  — список умов (аналогічно IF ноді).
 */
export interface SwitchRule {
  outputIndex:      number
  outputName:       string
  conditions:       SwitchCondition[]
  combineOperation: 'AND' | 'OR'
}

export const SwitchNodeDefinition: NodeDefinition = {
  executor: NodeDiscriminator.SWITCH_LOGIC,
  type: NodeType.LOGIC,
  category: NodeCategory.LOGIC,
  name: 'Switch',
  description: 'Route items to different outputs based on conditions',
  requiresCredentials: false,
  supportsMultipleItems: true,
  dynamicOutputs: true,

  outputs: {},

  parameters: [
    // ── Режим роботи ─────────────────────────────────────────────
    {
      name: 'mode',
      displayName: 'Mode',
      description: 'How to route items',
      type: ParameterType.OPTIONS,
      required: true,
      default: SwitchLogicMode.RULES,
      options: [
        { value: SwitchLogicMode.RULES,      name: 'Rules — match conditions' },
        { value: SwitchLogicMode.EXPRESSION, name: 'Expression — evaluate to port index' },
      ],
    },

    // ── RULES mode ───────────────────────────────────────────────
    {
      name: 'rules',
      displayName: 'Routing Rules',
      description: 'Each rule routes matching items to its output port',
      type: ParameterType.SWITCH_RULES,
      required: true,
      default: [] as SwitchRule[],
      displayCondition: {
        field: 'mode',
        values: [SwitchLogicMode.RULES],
      },
    },

    // ── EXPRESSION mode ──────────────────────────────────────────
    {
      name: 'expression',
      displayName: 'Expression',
      description: 'Must evaluate to a port index (0, 1, 2...)',
      type: ParameterType.STRING,
      required: true,
      placeholder: '{{$json.status}}',
      displayCondition: {
        field: 'mode',
        values: [SwitchLogicMode.EXPRESSION],
      },
    },

    // ── Загальні ─────────────────────────────────────────────────
    {
      name: 'fallbackEnabled',
      displayName: 'Add Fallback Output',
      description: 'Items that match no rule go to fallback port',
      type: ParameterType.BOOLEAN,
      default: true,
    },
  ],
}

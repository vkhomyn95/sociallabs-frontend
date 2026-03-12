import {
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types'

export const SwitchNodeDefinition: NodeDefinition = {
  executor: NodeDiscriminator.SWITCH_LOGIC,
  type: NodeType.LOGIC,
  category: NodeCategory.LOGIC,
  name: 'Switch',
  description: 'Route items to different outputs based on value',
  icon: 'fas fa-random',
  color: '#f59e0b',
  requiresCredentials: false,
  supportsMultipleItems: true,
  dynamicOutputs: true, // <- ключовий флаг

  outputs: {}, // динамічно заповнюється з rules

  parameters: [
    {
      name: 'switchValue',
      displayName: 'Value to switch on',
      type: ParameterType.STRING,
      required: true,
      placeholder: '{{$json.status}}'
    },
    {
      name: 'rules',
      displayName: 'Routing Rules',
      type: ParameterType.SWITCH_RULES, // спеціальний тип
      required: true,
      default: []
    },
    {
      name: 'fallbackToDefault',
      displayName: 'Add Default Output',
      type: ParameterType.BOOLEAN,
      default: true
    }
  ]
}

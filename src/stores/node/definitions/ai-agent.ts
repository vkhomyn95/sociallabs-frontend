// ─────────────────────────────────────────────────────────────────────────────
// stores/node/definitions/ai-agent.ts
// ─────────────────────────────────────────────────────────────────────────────
import {
  CredentialType,
  NodeCategory,
  type NodeDefinition,
  NodeDiscriminator,
  NodeType,
  ParameterType
} from '@/stores/node/types'

// ── Константи для селектів ────────────────────────────────────────────────────

export const SUPPORTED_MODELS = [
  { value: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  { value: 'claude-opus-4-20250514',   name: 'Claude Opus 4'   },
  { value: 'claude-haiku-4-20250514',  name: 'Claude Haiku 4'  },
  { value: 'gpt-4o',                   name: 'GPT-4o'          },
  { value: 'gpt-4o-mini',              name: 'GPT-4o mini'     },
  { value: 'o1',                       name: 'o1'              },
] as const

export const AI_OUTPUT_MODES = [
  { value: 'ANSWER_ONLY', name: 'Answer only'         },
  { value: 'WITH_STEPS',  name: 'With steps (debug)'  },
  { value: 'STRUCTURED',  name: 'Structured JSON'      },
] as const

// ── Sub-node slots ────────────────────────────────────────────────────────────
// Описують нижні порти AI Agent ноди.
// id → VueFlow handle = `sub-${id}`
// connectionType → що зберігається в Connection.type на бекенді

// export const AI_AGENT_SUB_SLOTS: SubNodeSlot[] = [
//   {
//     id:             'chatModel',
//     connectionType: ConnectionType.MAIN,
//     // Chat Model не має окремого ConnectionType на бекенді.
//     // Зберігається як MAIN з targetInputIndex = -1.
//     label:          'Chat Model',
//     icon:           'fas fa-microchip',
//     color:          '#8b5cf6',
//     multiple:       false,
//     description:    'Connect an LLM node (Claude, GPT-4o…)',
//   },
//   {
//     id:             'memory',
//     connectionType: ConnectionType.AI_MEMORY,
//     label:          'Memory',
//     icon:           'fas fa-database',
//     color:          '#06b6d4',
//     multiple:       false,
//     description:    'Connect a memory node for conversation history',
//   },
//   {
//     id:             'tool',
//     connectionType: ConnectionType.AI_TOOL,
//     label:          'Tool',
//     icon:           'fas fa-wrench',
//     color:          '#10b981',
//     multiple:       true,
//     description:    'Connect tool nodes the agent can call',
//   },
// ]

// ── NodeDefinition ────────────────────────────────────────────────────────────

export const AiAgentNodeDefinition: NodeDefinition = {
  executor:             NodeDiscriminator.AI_AGENT,
  type:                 NodeType.ACTION,
  category:             NodeCategory.AI,
  name:                 'AI Agent',
  description:          'ReAct agent — LLM with tools, memory and guardrails',
  requiresCredentials:  true,
  supportedCredentialTypes: [CredentialType.API_KEY],
  supportsMultipleItems: true,

  outputs: {
    main: {
      name:        'main',
      displayName: 'Output',
      type:        'object',
      description: 'Agent response',
      position:    'right',
    },
    ai_model: {
      name:        'model',
      displayName: 'Chat Model',
      type:        'ai-model',
      description: 'Connect an LLM node',
      position:    'bottom',
      color:       '#8b5cf6',
    },
    ai_memory: {
      name:        'memory',
      displayName: 'Memory',
      type:        'ai-memory',
      description: 'Connect a memory node',
      position:    'bottom',
      color:       '#06b6d4',
    },
    ai_tools: {
      name:        'tools',
      displayName: 'Tools',
      type:        'ai-tool',
      description: 'Connect tool nodes',
      position:    'bottom',
      multiple:    true,
      color:       '#10b981',
    },
  },

  parameters: [
    {
      name:        'systemPrompt',
      displayName: 'System prompt',
      type:        ParameterType.MULTILINE,
      required:    false,
      default:     'You are a helpful assistant.',
      placeholder: 'Describe what this agent should do…',
    },
    {
      name:        'inputField',
      displayName: 'Input field',
      description: 'Field from item.json to use as user message. Leave blank to use entire item.',
      type:        ParameterType.STRING,
      required:    false,
      default:     '',
      placeholder: 'e.g. text, message, userQuery',
    },
    {
      name:        'outputField',
      displayName: 'Output field',
      type:        ParameterType.STRING,
      required:    false,
      default:     'answer',
    },
    {
      name:        'outputMode',
      displayName: 'Output mode',
      type:        ParameterType.OPTIONS,
      required:    false,
      default:     'ANSWER_ONLY',
      options:     AI_OUTPUT_MODES.map(m => ({ value: m.value, name: m.name })),
    },
    {
      name:           'structuredOutputSchema',
      displayName:    'JSON Schema',
      description:    'Schema for structured output parsing',
      type:           ParameterType.JSON,
      required:       false,
      default:        '',
      displayOptions: { show: { outputMode: ['STRUCTURED'] } },
    },
    {
      name:        'maxIterations',
      displayName: 'Max iterations',
      type:        ParameterType.NUMBER,
      required:    false,
      default:     8,
      min:         1,
      max:         50,
    },
    {
      name:        'maxToolCalls',
      displayName: 'Max tool calls',
      type:        ParameterType.NUMBER,
      required:    false,
      default:     12,
      min:         1,
      max:         50,
    },
    {
      name:        'timeoutMs',
      displayName: 'Timeout (ms)',
      type:        ParameterType.NUMBER,
      required:    false,
      default:     30_000,
      min:         1000,
    },
    {
      name:        'continueOnFail',
      displayName: 'Continue on fail',
      type:        ParameterType.BOOLEAN,
      required:    false,
      default:     false,
    },
    {
      name:           'fallbackOutput',
      displayName:    'Fallback output value',
      type:           ParameterType.STRING,
      required:       false,
      default:        '',
      displayOptions: { show: { continueOnFail: [true] } },
    },
  ],
}

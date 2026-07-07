import type { NodeInstance, NodeType } from '@/stores/node/types.ts'
import { NodeDiscriminator } from '@/stores/node/types.ts'

export interface WorkflowState {
  workflow: Workflow;
  workflows: Workflow[];
  count: number;
  loading: boolean;
  error: string | null;
  currentNodeId: string | undefined;
}

export interface Workflow {
  id?: number;
  name: string;
  description: string;
  active: boolean;
  nodes: NodeInstance[];
  connections: Connection[];
  settings?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Connection {
  id?: string;
  sourceNodeId: string;
  sourceOutputIndex: number;
  targetNodeId: string;
  targetInputIndex: number;
  type: ConnectionType;
}

export enum ConnectionType {
  /** Звичайний data flow між нодами */
  MAIN       = 'MAIN',
  AI_AGENT    = 'AI_AGENT',
  /** Tool підключений до AI Agent */
  AI_TOOL    = 'AI_TOOL',
  /** Memory підключена до AI Agent */
  AI_MEMORY  = 'AI_MEMORY',
  /** AI Agent вихідний результат (резервний) */
  AI_OUTPUT  = 'AI_OUTPUT',
}

export const HANDLE_TO_CONNECTION_TYPE: Record<string, ConnectionType> = {
  'ai_model':  ConnectionType.AI_AGENT,
  'ai_memory': ConnectionType.AI_MEMORY,
  'ai_tools':  ConnectionType.AI_TOOL,
}

export enum WorkflowNodeType {
  IF = 'if',
  SWITCH = 'switch',
  AGENT = 'agent',
  CUSTOM = 'custom',
}

export const NODE_DISCRIMINATOR_TO_WORKFLOW_NODE_TYPE: Partial<Record<NodeDiscriminator, WorkflowNodeType>> = {
  [NodeDiscriminator.IF_LOGIC]: WorkflowNodeType.IF,
  [NodeDiscriminator.SWITCH_LOGIC]: WorkflowNodeType.SWITCH,
  [NodeDiscriminator.AI_AGENT]: WorkflowNodeType.AGENT,
}

export const NODE_PORT_COLORS: Record<number, string> = {
  [-1]: '#e5e7eb',
  [0]: '#10b981',
  [1]: '#ef4444',
  [2]: '#f59e0b',
  [3]: '#8b5cf6',
  [4]: '#06b6d4',
  [5]: '#6366f1',
}

const SUB_NODE_PORT_COLORS: Partial<Record<NodeType, string>> = {
  AI_MODEL:  '#8b5cf6',
  AI_MEMORY: '#06b6d4',
  AI_TOOL:   '#10b981',
}

type EdgePortResolver = {
  color?: (idx: number) => string
  label?: (src: NodeInstance, idx: number) => string
}

const EDGE_RESOLVERS: Partial<Record<NodeDiscriminator, EdgePortResolver>> = {
  [NodeDiscriminator.IF_LOGIC]: {
    color: (idx) => NODE_PORT_COLORS[idx] ?? NODE_PORT_COLORS[-1],

    label: (_, idx) => (idx === 0 ? 'true' : 'false'),
  },

  [NodeDiscriminator.SWITCH_LOGIC]: {
    color: (idx) => NODE_PORT_COLORS[idx] ?? NODE_PORT_COLORS[-1],

    label: (src, idx) => {
      const rules: Array<{ outputIndex: number; outputName?: string }> = src.parameters?.rules ?? []

      const rule = rules.find(r => r.outputIndex === idx)

      return rule ? rule.outputName || String(idx) : 'fallback'
    },
  },
}

export const resolveEdgeColor = (src: NodeInstance | undefined, idx: number): string => {
  if (!src) {
    return NODE_PORT_COLORS[-1]
  }

  const resolver = EDGE_RESOLVERS[src.discriminator]

  return (
    resolver?.color?.(idx)
    ?? NODE_PORT_COLORS[-1]
  )
}

export const resolveEdgeLabel = (src: NodeInstance | undefined, idx: number): string => {
  if (!src) {
    return ''
  }

  const resolver = EDGE_RESOLVERS[src.discriminator]

  return resolver?.label?.(src, idx) ?? ''
}

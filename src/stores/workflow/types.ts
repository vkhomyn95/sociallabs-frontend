import type { NodeInstance } from '@/stores/node/types.ts'

export interface WorkflowState {
  workflow: Workflow | null;
  workflows: Workflow[];
  count: number;
  loading: boolean;
  error: string | null;
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
  id?: number;
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

export const CONNECTION_TYPE_TO_HANDLE: Partial<Record<ConnectionType, string>> = {
  [ConnectionType.AI_AGENT]:  'ai_model',
  [ConnectionType.AI_MEMORY]: 'ai_memory',
  [ConnectionType.AI_TOOL]:   'ai_tools',
}

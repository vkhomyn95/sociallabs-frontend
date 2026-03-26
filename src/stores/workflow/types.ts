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
}

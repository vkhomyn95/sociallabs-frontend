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

export interface NodeInstance {
  id: string;
  nodeType: string;
  type: string;
  name: string;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  credentialId?: number;
  disabled: boolean;
  notes?: string;
}

export interface Connection {
  id?: number;
  sourceNodeId: string;
  sourceOutput: string;
  targetNodeId: string;
  targetInput: string;
}

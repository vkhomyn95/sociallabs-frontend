export interface NodeState {
  availableNodes: AvailableNodes | null;
  selectedNodeDefinition: NodeDefinition | null;
  loading: boolean;
  error: string | null;
}

// ========== Backend Response Types ==========

export interface AvailableNodes {
  nodes: NodeMetadata[];
  categories: Record<string, NodeMetadata[]>;
}

export interface NodeMetadata {
  discriminator: NodeDiscriminator;
  type: NodeType;
  category: NodeCategory;
  supportedCredential: CredentialType | null;
}

// ========== Enums ==========

export enum NodeType {
  TRIGGER = 'TRIGGER',
  ACTION = 'ACTION',
  TRANSFORM = 'TRANSFORM'
}

export enum NodeCategory {
  COMMUNICATION = 'COMMUNICATION',
}

export enum CredentialType {
  API_KEY = 'API_KEY',
  HTTP_AUTH = 'HTTP_AUTH',
  TELEGRAM_CLIENT = 'TELEGRAM_CLIENT',
}

export enum NodeDiscriminator {
  TELEGRAM_BOT_ACTION = 'TELEGRAM_BOT_ACTION',
  TELEGRAM_BOT_TRIGGER = 'TELEGRAM_BOT_TRIGGER',
  TELEGRAM_CLIENT_ACTION = 'TELEGRAM_CLIENT_ACTION',
  TELEGRAM_CLIENT_TRIGGER = 'TELEGRAM_CLIENT_TRIGGER'
}

// ========== Parameter Types ==========

export enum ParameterType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OPTIONS = 'options',
  JSON = 'json',
  MULTILINE = 'multiline',
  COLLECTION = 'collection'
}

export interface NodeParameter {
  name: string;
  displayName: string;
  description: string;
  type: ParameterType;
  required: boolean;
  default?: any;
  options?: ParameterOption[];
  min?: number;
  max?: number;
  multiline?: boolean;
  placeholder?: string;
  displayCondition?: DisplayCondition;
}

export interface ParameterOption {
  value: string;
  name: string;
  description?: string;
}

export interface DisplayCondition {
  field: string;
  values: string[];
}

// ========== Node Definition (Frontend) ==========

export interface NodeDefinition {
  // Metadata
  executor: NodeDiscriminator;
  type: NodeType;
  category: NodeCategory;

  // Display
  name: string;
  description: string;
  icon: string;
  color: string;

  // Configuration
  parameters: NodeParameter[];
  outputs: Record<string, NodeOutput>;
  supportedCredentialTypes?: CredentialType[];

  // Behavior
  requiresCredentials: boolean;
  supportsMultipleItems: boolean;
}

export interface NodeOutput {
  name: string;
  displayName: string;
  type: string;
  description: string;
}

// ========== Enriched Node (для UI) ==========

export interface EnrichedNodeMetadata extends NodeMetadata {
  name: string;
  description: string;
  icon: string;
  color: string;
}

// ========== Node Instance (from backend) ==========

export interface NodeInstance {
  id?: number;
  nodeId: string;
  type: NodeType;
  discriminator: NodeDiscriminator;
  name: string;
  positionX: number;
  positionY: number;
  parameters: Record<string, any>;
  credentialId?: number;
  disabled: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ========== Display Configuration ==========

export interface NodeDisplayConfig {
  icon: string;
  color: string;
  category: NodeCategory;
}

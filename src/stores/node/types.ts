import { ConnectionType } from '@/stores/workflow/types.ts'

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
  TRANSFORM = 'TRANSFORM',
  LOGIC = 'LOGIC',
}

export enum NodeCategory {
  COMMUNICATION = 'COMMUNICATION',
  LOGIC = 'LOGIC',
  CORE = 'CORE',
  AI = 'AI'
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
  TELEGRAM_CLIENT_TRIGGER = 'TELEGRAM_CLIENT_TRIGGER',

  IF_LOGIC = 'IF_LOGIC',
  SWITCH_LOGIC = 'SWITCH_LOGIC',

  HTTP_REQUEST = 'HTTP_REQUEST',

  AI_AGENT = 'AI_AGENT',
}

// ========== Parameter Types ==========

export enum ParameterType {
  STRING       = 'STRING',
  MULTILINE    = 'MULTILINE',
  NUMBER       = 'NUMBER',
  BOOLEAN      = 'BOOLEAN',
  OPTIONS      = 'OPTIONS',
  MULTI_OPTIONS = 'multiOptions',
  JSON         = 'JSON',
  CONDITIONS   = 'conditions',    // спеціальний — рендерить ConditionsEditor
  SWITCH_RULES = 'switch-rules',  // спеціальний — рендерить SwitchRulesEditor
  AI_AGENT = 'ai-agent'
}

export interface NodeParameter {
  name: string;
  displayName: string;
  description?: string;
  type: ParameterType;
  required?: boolean;
  default?: any;
  options?: ParameterOption[];
  min?: number;
  max?: number;
  multiline?: boolean;
  placeholder?: string;
  displayCondition?: DisplayCondition;
  displayOptions?: { show: Record<string, any[]> }
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

  // Configuration
  parameters: NodeParameter[];
  outputs: Record<string, NodeOutput>;
  supportedCredentialTypes?: CredentialType[];

  // Behavior
  requiresCredentials?: boolean;
  supportsMultipleItems?: boolean;
  dynamicOutputs?: boolean;
}

export interface NodeOutput {
  name: string;
  displayName: string;
  type: string;
  description: string;
  schema?: any;
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
  name: string;
  type: NodeType;
  discriminator: NodeDiscriminator;
  positionX: number;
  positionY: number;
  parameters: Record<string, any>;
  credentialId?: number;
  disabled: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const SUB_SLOT_TARGET_INDEX: Record<string, number> = {
  [ConnectionType.AI_AGENT]: -1,
  [ConnectionType.AI_MEMORY]: -2,
  [ConnectionType.AI_TOOL]: -3
}

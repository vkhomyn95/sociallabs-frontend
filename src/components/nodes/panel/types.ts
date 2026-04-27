// ─── Panel Navigation Types ───────────────────────────────────────────────────

import type { NodeType } from '@/stores/node/types.ts'

export enum PanelStep {
  TYPE     = 'type',
  CATEGORY = 'category',
  NODES    = 'nodes',
}

export interface NodeTypeOption {
  value: NodeType
  label: string
  description: string
  icon: string
  color: string
}

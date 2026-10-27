import { NodeTypeStatus } from '@/core/node-types/descriptor'
import { presentationOf, type NodePresentation } from '../presentation'
import { CreatorCategory, CreatorItemKind, type CreatorItem } from './creatorModel'

const CATEGORY_LOOK: Readonly<Record<CreatorCategory, NodePresentation>> = {
  [CreatorCategory.APPS]: { icon: 'object_comments', color: '#0088cc' },
  [CreatorCategory.AI]: { icon: 'ai_sparkle', color: '#7c3aed' },
  [CreatorCategory.FLOW]: { icon: 'dev_branch', color: '#ef4444' },
  [CreatorCategory.DATA]: { icon: 'dev_database', color: '#0891b2' },
  [CreatorCategory.CORE]: { icon: 'dev_nodes', color: '#475569' },
  [CreatorCategory.TRIGGERS]: { icon: 'action_bolt', color: '#f59e0b' },
}

/** Icon and accent of a row of the node creator. */
export function lookOf(item: CreatorItem): NodePresentation {
  switch (item.kind) {
    case CreatorItemKind.NODE:
      return presentationOf(item.type.name, item.type)
    case CreatorItemKind.APP:
      // Presentations are keyed by the service prefix of type names.
      return presentationOf(item.service)
    case CreatorItemKind.CATEGORY:
      return CATEGORY_LOOK[item.category]
  }
}

/** Whether the row opens another view rather than adding a node. */
export const opensView = (item: CreatorItem): boolean => item.kind !== CreatorItemKind.NODE

export const isPreview = (item: CreatorItem): boolean => item.kind === CreatorItemKind.NODE && item.type.status === NodeTypeStatus.PREVIEW

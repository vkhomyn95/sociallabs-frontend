import { slbIcons, type SlbIconName } from '@sociallabs/frontend-components'
import { NodeGroup, type NodeTypeDescriptor } from '@/core/node-types/descriptor'

export interface NodePresentation {
  readonly icon: SlbIconName
  readonly color: string
}

const BY_TYPE: Readonly<Record<string, NodePresentation>> = {
  'core.if': { icon: 'dev_branch', color: '#ef4444' },
  'core.switch': { icon: 'dev_sitemap', color: '#f59e0b' },
  'core.webhook': { icon: 'dev_webhook', color: '#0f766e' },
  'core.schedule': { icon: 'object_clock', color: '#0f766e' },
  'http.request': { icon: 'object_globe', color: '#2563eb' },
}

/** Node types of one service share its brand; the prefix of the type name is the service. */
const BY_SERVICE: Readonly<Record<string, NodePresentation>> = {
  telegram: { icon: 'brand_telegram', color: '#0088cc' },
  viber: { icon: 'brand_viber', color: '#7360f2' },
  whatsapp: { icon: 'brand_whatsapp', color: '#25d366' },
  messenger: { icon: 'brand_messenger', color: '#168aff' },
  instagram: { icon: 'brand_instagram', color: '#ff7a00' },
  ai: { icon: 'ai_agent', color: '#7c3aed' },
}

const BY_GROUP: Readonly<Record<NodeGroup, NodePresentation>> = {
  [NodeGroup.CORE]: { icon: 'dev_nodes', color: '#475569' },
  [NodeGroup.LOGIC]: { icon: 'dev_branch', color: '#ef4444' },
  [NodeGroup.DATA]: { icon: 'dev_database', color: '#0891b2' },
  [NodeGroup.COMMUNICATION]: { icon: 'object_comments', color: '#0088cc' },
  [NodeGroup.AI]: { icon: 'ai_sparkle', color: '#7c3aed' },
}

const UNKNOWN: NodePresentation = { icon: 'dev_plug', color: '#6b7280' }

const isIcon = (name: string): name is SlbIconName => name in slbIcons

/**
 * @param typeName   node type name, e.g. `telegram.botAction`
 * @param descriptor its descriptor; an icon declared there wins
 * @returns icon and accent color of nodes of the type
 */
export function presentationOf(typeName: string, descriptor?: NodeTypeDescriptor): NodePresentation {
  const base =
    BY_TYPE[typeName] ?? BY_SERVICE[typeName.split('.')[0]!] ?? (descriptor ? BY_GROUP[descriptor.group] : undefined) ?? UNKNOWN
  return descriptor?.icon && isIcon(descriptor.icon) ? { ...base, icon: descriptor.icon } : base
}

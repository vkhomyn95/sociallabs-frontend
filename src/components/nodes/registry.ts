import type { Component, DefineComponent } from 'vue'
import { NodeDiscriminator } from '@/stores/node/types'

export type NodePanelComponent = Component | DefineComponent<any, any, any>

/**
 * Central registry: NodeDiscriminator → Vue panel component.
 * Each node registers its own dedicated panel — no god-component.
 * Add a new node type by importing its panel and calling register().
 */
const registry = new Map<NodeDiscriminator, () => Promise<NodePanelComponent>>()

export function registerNodePanel(
  discriminator: NodeDiscriminator,
  loader: () => Promise<NodePanelComponent>
): void {
  registry.set(discriminator, loader)
}

export async function resolveNodePanel(
  discriminator: NodeDiscriminator
): Promise<NodePanelComponent | null> {
  const loader = registry.get(discriminator)
  if (!loader) return null
  return loader()
}

export function hasNodePanel(discriminator: NodeDiscriminator): boolean {
  return registry.has(discriminator)
}

// ─── Register all known panels (lazy-loaded) ──────────────────────────────

// registerNodePanel(
//   NodeDiscriminator.TELEGRAM_BOT_ACTION,
//   () => import('./telegram/TelegramBotActionPanel.vue').then(m => m.default)
// )
//
// registerNodePanel(
//   NodeDiscriminator.TELEGRAM_BOT_TRIGGER,
//   () => import('./telegram/TelegramBotTriggerPanel.vue').then(m => m.default)
// )
//
// registerNodePanel(
//   NodeDiscriminator.TELEGRAM_CLIENT_ACTION,
//   () => import('./telegram/TelegramClientPanel.vue').then(m => m.default)
// )
//
// registerNodePanel(
//   NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER,
//   () => import('./telegram/TelegramClientTriggerPanel.vue').then(m => m.default)
// )
//
// registerNodePanel(
//   NodeDiscriminator.IF_LOGIC,
//   () => import('./logic/IfLogicPanel.vue').then(m => m.default)
// )
//
// registerNodePanel(
//   NodeDiscriminator.SWITCH_LOGIC,
//   () => import('./logic/SwitchLogicPanel.vue').then(m => m.default)
// )

registerNodePanel(
  NodeDiscriminator.AI_AGENT,
  () => import('./ai-agent/AIAgentPanel.vue').then(m => m.default)
)

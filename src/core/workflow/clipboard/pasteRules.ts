import type { NodeModel } from '../model'

/**
 * Adjusts a pasted copy of a node whose type carries something that must stay unique per instance,
 * e.g. the public path of a webhook. Rules run after the copy got its new id and name.
 */
export interface PasteRule {
  /** @returns whether the rule adjusts this node */
  appliesTo(node: NodeModel): boolean
  /** @returns the adjusted copy */
  apply(node: NodeModel): NodeModel
}

/** Node type whose `path` parameter is a public URL segment. */
const WEBHOOK_TYPE = 'core.webhook'

/**
 * Two webhooks on one path would collide on activation, so a pasted webhook gets a fresh random path,
 * as n8n gives a pasted webhook a new webhook id.
 */
export class WebhookPathRule implements PasteRule {
  constructor(private readonly newPath: () => string = () => crypto.randomUUID()) {}

  appliesTo(node: NodeModel): boolean {
    return node.type === WEBHOOK_TYPE
  }

  apply(node: NodeModel): NodeModel {
    return { ...node, parameters: { ...node.parameters, path: this.newPath() } }
  }
}

/** Rules every paste applies. */
export const DEFAULT_PASTE_RULES: readonly PasteRule[] = [new WebhookPathRule()]

/**
 * @param node  pasted copy
 * @param rules rules to run, in order
 * @returns the copy with every applicable rule applied
 */
export function applyPasteRules(node: NodeModel, rules: readonly PasteRule[]): NodeModel {
  return rules.reduce((current, rule) => (rule.appliesTo(current) ? rule.apply(current) : current), node)
}

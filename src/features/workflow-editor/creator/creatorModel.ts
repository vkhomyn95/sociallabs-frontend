import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { CreatorCatalog } from './creatorCatalog'
import { CreatorItemKind, type CreatorOptions, type CreatorView, type NodeItem, type OpeningItem } from './creatorTypes'
import { CreatorViews } from './creatorViews'
import { itemsOf, plainItem } from './entries'
import { SERVICE_LABELS, serviceOf } from './services'
import { variantOf, VARIANT_LABELS } from './variants'

export * from './creatorTypes'
export { itemsOf } from './entries'

const MAX_SEARCH_RESULTS = 40

const byTitle = (a: { title: string }, b: { title: string }): number => a.title.localeCompare(b.title)

/**
 * The node creator's content: the first view, the view an app, variant or category opens, and search across every
 * node, action and trigger event that may be added where the creator was opened.
 */
export class NodeCreatorModel {
  private readonly catalog: CreatorCatalog
  private readonly views: CreatorViews

  constructor(types: readonly NodeTypeDescriptor[], options: CreatorOptions) {
    this.catalog = new CreatorCatalog(types, options)
    this.views = new CreatorViews(this.catalog)
  }

  root(): CreatorView {
    return this.views.root()
  }

  /** @returns the view an app, variant or category item opens */
  open(item: OpeningItem): CreatorView {
    switch (item.kind) {
      case CreatorItemKind.APP:
        return this.views.app(item.service, item.scope)
      case CreatorItemKind.VARIANT:
        return this.views.variant(item.service, item.variant, item.scope)
      case CreatorItemKind.CATEGORY:
        return this.views.category(item.category)
    }
  }

  /** Node entries, actions and events whose title, description or app matches, best matches first. */
  search(query: string): NodeItem[] {
    const needle = query.trim().toLowerCase()
    if (!needle) return []
    const candidates = this.catalog.types.flatMap((type) => {
      const items = itemsOf(type)
      // A node split into actions is found by its own name too.
      return items[0]?.key === type.key ? items : [plainItem(type), ...items]
    })
    return candidates
      .map((item) => ({ item, score: scoreOf(item, needle) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || byTitle(a.item, b.item))
      .slice(0, MAX_SEARCH_RESULTS)
      .map(({ item }) => item)
  }
}

/** Title prefix beats word prefix beats a match anywhere; description, app and variant count less. */
function scoreOf(item: NodeItem, needle: string): number {
  const title = item.title.toLowerCase()
  if (title.startsWith(needle)) return 4
  if (title.split(/\s+/).some((word) => word.startsWith(needle))) return 3
  if (title.includes(needle)) return 2
  return contextOf(item).includes(needle) ? 1 : 0
}

function contextOf(item: NodeItem): string {
  const app = serviceOf(item.type.name)
  const variant = variantOf(item.type)
  const parts = [item.description, item.type.displayName, app ? SERVICE_LABELS[app] : '', variant ? VARIANT_LABELS[variant] : '']
  return parts.join(' ').toLowerCase()
}

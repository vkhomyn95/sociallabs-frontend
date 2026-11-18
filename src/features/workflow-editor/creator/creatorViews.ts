import { NodeKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { CreatorCatalog } from './creatorCatalog'
import {
  CATEGORIES,
  CreatorCategory,
  CreatorItemKind,
  EntryScope,
  NEXT_ORDER,
  SCOPE_NOUNS,
  scopeOf,
  type AppItem,
  type CategoryItem,
  type CreatorSection,
  type CreatorView,
  type VariantItem,
} from './creatorTypes'
import { entryGroupsOf, itemsOf, plainItem } from './entries'
import { SERVICE_LABELS, serviceOf, type Service } from './services'
import { variantOf, VARIANT_LABELS, type AppVariant } from './variants'

/** Heading of an app view's scope, and of trigger events that come without groups. */
const SCOPE_HEADINGS: Readonly<Record<EntryScope, string>> = {
  [EntryScope.TRIGGERS]: 'Triggers',
  [EntryScope.ACTIONS]: 'Actions',
}

const byTitle = (a: { title: string }, b: { title: string }): number => a.title.localeCompare(b.title)

/** @returns e.g. "1 trigger", "26 actions" */
export function countLabel(count: number, scope: EntryScope): string {
  const nouns = SCOPE_NOUNS[scope]
  return `${count} ${count === 1 ? nouns.one : nouns.many}`
}

const entryCount = (types: readonly NodeTypeDescriptor[]): number => types.flatMap(itemsOf).length

/**
 * Builds the views of the node creator from the catalog of what may be added. An app opened from the triggers lists
 * only its triggers, one opened from "Action in an app" only its actions, so the counts on the way in match the view.
 */
export class CreatorViews {
  constructor(private readonly catalog: CreatorCatalog) {}

  /** The first view: sub-nodes when only they fit, triggers for a workflow without one, otherwise what happens next. */
  root(): CreatorView {
    const types = this.catalog.types
    if (types.length && types.every((type) => type.kind === NodeKind.SUPPLY)) {
      return { key: 'sub-nodes', title: 'Add a sub-node', subtitle: 'Attach it to the agent', sections: [nodeSection('', types)] }
    }
    const { allowTriggers, hasTrigger } = this.catalog.options
    if (allowTriggers && !hasTrigger && this.catalog.triggers().length) return this.triggers()
    const categories = NEXT_ORDER.filter((category) => this.catalog.typesOf(category).length).map(categoryItem)
    return { key: 'next', title: 'What happens next?', subtitle: '', sections: [{ key: 'categories', title: '', items: categories }] }
  }

  triggers(): CreatorView {
    const core = this.catalog.triggers().filter((type) => serviceOf(type.name) === null)
    const apps = this.appItems(EntryScope.TRIGGERS)
    return {
      key: 'triggers',
      title: 'What triggers this workflow?',
      subtitle: 'A trigger starts the workflow when something happens',
      sections: [
        ...(core.length ? [nodeSection('Core', core)] : []),
        ...(apps.length ? [{ key: 'apps', title: 'Apps', items: apps }] : []),
      ],
    }
  }

  category(category: CreatorCategory): CreatorView {
    if (category === CreatorCategory.TRIGGERS) return this.triggers()
    const { title, description } = CATEGORIES[category]
    if (category === CreatorCategory.APPS) {
      const apps = this.appItems(EntryScope.ACTIONS)
      return { key: category, title, subtitle: description, sections: [{ key: 'apps', title: '', items: apps }] }
    }
    const types = this.catalog.typesOf(category)
    const main = types.filter((type) => type.kind !== NodeKind.SUPPLY)
    const supply = types.filter((type) => type.kind === NodeKind.SUPPLY)
    return {
      key: category,
      title,
      subtitle: description,
      sections: [
        ...(main.length ? [nodeSection('', main)] : []),
        ...(supply.length ? [nodeSection('Sub-nodes: models, memory and tools', supply)] : []),
      ],
    }
  }

  /** An app used both as an account and as a bot offers the two first; otherwise its entries of the scope. */
  app(service: Service, scope: EntryScope): CreatorView {
    const variants = this.catalog.variantsOf(service, scope)
    if (variants.length > 1) {
      return {
        key: `app:${service}:${scope}`,
        title: SERVICE_LABELS[service],
        subtitle: SCOPE_HEADINGS[scope],
        sections: [{ key: 'variants', title: '', items: variants.map((variant) => this.variantItem(service, variant, scope)) }],
      }
    }
    return scopedView(`app:${service}:${scope}`, SERVICE_LABELS[service], this.catalog.typesOfService(service, scope), scope)
  }

  variant(service: Service, variant: AppVariant, scope: EntryScope): CreatorView {
    const types = this.variantTypes(service, variant, scope)
    return scopedView(`app:${service}:${variant}:${scope}`, variantTitle(service, variant), types, scope)
  }

  /** The apps that have entries of the scope, by name. */
  private appItems(scope: EntryScope): AppItem[] {
    const services = new Set(
      this.catalog.types
        .filter((type) => scopeOf(type) === scope)
        .map((type) => serviceOf(type.name))
        .filter((service): service is Service => service !== null),
    )
    return [...services].map((service) => this.appItem(service, scope)).sort(byTitle)
  }

  private appItem(service: Service, scope: EntryScope): AppItem {
    const count = countLabel(entryCount(this.catalog.typesOfService(service, scope)), scope)
    const variants = this.catalog.variantsOf(service, scope)
    const split = variants.length > 1 ? `${variants.map((variant) => VARIANT_LABELS[variant]).join(' and ')} · ` : ''
    return {
      kind: CreatorItemKind.APP,
      key: `app:${service}:${scope}`,
      service,
      scope,
      title: SERVICE_LABELS[service],
      description: split + count,
    }
  }

  private variantItem(service: Service, variant: AppVariant, scope: EntryScope): VariantItem {
    return {
      kind: CreatorItemKind.VARIANT,
      key: `app:${service}:${variant}:${scope}`,
      service,
      variant,
      scope,
      title: variantTitle(service, variant),
      description: countLabel(entryCount(this.variantTypes(service, variant, scope)), scope),
    }
  }

  private variantTypes(service: Service, variant: AppVariant, scope: EntryScope): NodeTypeDescriptor[] {
    return this.catalog.typesOfService(service, scope).filter((type) => variantOf(type) === variant)
  }
}

const variantTitle = (service: Service, variant: AppVariant): string => `${SERVICE_LABELS[service]} ${VARIANT_LABELS[variant]}`

/** The entries of an app's types of one scope, under their headings, with their count as the subtitle. */
function scopedView(key: string, title: string, types: readonly NodeTypeDescriptor[], scope: EntryScope): CreatorView {
  return {
    key,
    title,
    subtitle: countLabel(entryCount(types), scope),
    sections: types.flatMap((type) => sectionsOf(type, scope)),
  }
}

/**
 * The entries of a type under their headings: trigger events by group of events, actions by resource. Without such
 * groups a trigger's events go under "Triggers" and an action's operations under the type's name.
 */
function sectionsOf(type: NodeTypeDescriptor, scope: EntryScope): CreatorSection[] {
  const fallback = scope === EntryScope.TRIGGERS ? SCOPE_HEADINGS[scope] : type.displayName
  return entryGroupsOf(type).map((group) => ({ key: group.key, title: group.title || fallback, items: group.items }))
}

function nodeSection(title: string, types: readonly NodeTypeDescriptor[]): CreatorSection {
  return { key: title || 'nodes', title, items: types.map(plainItem).sort(byTitle) }
}

function categoryItem(category: CreatorCategory): CategoryItem {
  return { kind: CreatorItemKind.CATEGORY, key: `category:${category}`, category, ...CATEGORIES[category] }
}

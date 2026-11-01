import { NodeKind, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import type { CreatorCatalog } from './creatorCatalog'
import {
  CATEGORIES,
  CreatorCategory,
  CreatorItemKind,
  NEXT_ORDER,
  type AppItem,
  type CategoryItem,
  type CreatorSection,
  type CreatorView,
  type VariantItem,
} from './creatorTypes'
import { entryGroupsOf, itemsOf, plainItem } from './entries'
import { SERVICE_LABELS, serviceOf, type Service } from './services'
import { variantOf, VARIANT_LABELS, type AppVariant } from './variants'

const TRIGGERS = 'Triggers'

const byTitle = (a: { title: string }, b: { title: string }): number => a.title.localeCompare(b.title)
const countLabel = (count: number): string => `${count} ${count === 1 ? 'entry' : 'entries'}`

/** Builds the views of the node creator from the catalog of what may be added. */
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
    const triggers = this.catalog.triggers()
    const core = triggers.filter((type) => serviceOf(type.name) === null)
    const apps = this.appItems(triggers)
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
    const types = this.catalog.typesOf(category)
    const { title, description } = CATEGORIES[category]
    if (category === CreatorCategory.APPS) {
      return { key: category, title, subtitle: description, sections: [{ key: 'apps', title: '', items: this.appItems(types) }] }
    }
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

  /** An app used both as an account and as a bot offers the two first; otherwise its triggers and actions. */
  app(service: Service): CreatorView {
    const variants = this.catalog.variantsOf(service)
    if (variants.length > 1) {
      const items = variants.map((variant) => this.variantItem(service, variant))
      return { key: `app:${service}`, title: SERVICE_LABELS[service], subtitle: '', sections: [{ key: 'variants', title: '', items }] }
    }
    return {
      key: `app:${service}`,
      title: SERVICE_LABELS[service],
      subtitle: '',
      sections: appSections(this.catalog.typesOfService(service)),
    }
  }

  variant(service: Service, variant: AppVariant): CreatorView {
    const types = this.catalog.typesOfService(service).filter((type) => variantOf(type) === variant)
    return {
      key: `app:${service}:${variant}`,
      title: variantTitle(service, variant),
      subtitle: '',
      sections: appSections(types),
    }
  }

  private appItems(types: readonly NodeTypeDescriptor[]): AppItem[] {
    const services = [...new Set(types.map((type) => serviceOf(type.name)).filter((s): s is Service => s !== null))]
    return services
      .map((service) => ({
        kind: CreatorItemKind.APP as const,
        key: `app:${service}`,
        service,
        title: SERVICE_LABELS[service],
        description: countLabel(types.filter((type) => serviceOf(type.name) === service).flatMap(itemsOf).length),
      }))
      .sort(byTitle)
  }

  private variantItem(service: Service, variant: AppVariant): VariantItem {
    const count = this.catalog
      .typesOfService(service)
      .filter((type) => variantOf(type) === variant)
      .flatMap(itemsOf).length
    return {
      kind: CreatorItemKind.VARIANT,
      key: `app:${service}:${variant}`,
      service,
      variant,
      title: variantTitle(service, variant),
      description: countLabel(count),
    }
  }
}

const variantTitle = (service: Service, variant: AppVariant): string => `${SERVICE_LABELS[service]} ${VARIANT_LABELS[variant]}`

/**
 * Triggers first, by group of events ("Triggers · Messages"), then the actions of every type: by resource when it has
 * resources, else under the type's name.
 */
function appSections(types: readonly NodeTypeDescriptor[]): CreatorSection[] {
  const triggers = types.filter((type) => type.kind === NodeKind.TRIGGER)
  const actions = types.filter((type) => type.kind !== NodeKind.TRIGGER)
  return [...triggers.flatMap(triggerSections), ...actions.flatMap(actionSections)]
}

function triggerSections(type: NodeTypeDescriptor): CreatorSection[] {
  return entryGroupsOf(type).map((group) => ({
    key: group.key,
    title: group.title ? `${TRIGGERS} · ${group.title}` : TRIGGERS,
    items: group.items,
  }))
}

function actionSections(type: NodeTypeDescriptor): CreatorSection[] {
  return entryGroupsOf(type).map((group) => ({
    key: group.key,
    title: group.title || type.displayName,
    items: group.items,
  }))
}

function nodeSection(title: string, types: readonly NodeTypeDescriptor[]): CreatorSection {
  return { key: title || 'nodes', title, items: types.map(plainItem).sort(byTitle) }
}

function categoryItem(category: CreatorCategory): CategoryItem {
  return { kind: CreatorItemKind.CATEGORY, key: `category:${category}`, category, ...CATEGORIES[category] }
}

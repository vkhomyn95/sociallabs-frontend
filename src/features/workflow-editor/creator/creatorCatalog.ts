import { NodeKind, NodeTypeStatus, type NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { CATEGORY_OF_GROUP, CreatorCategory, scopeOf, type CreatorOptions, type EntryScope } from './creatorTypes'
import { serviceOf, type Service } from './services'
import { variantOf, VARIANT_ORDER, type AppVariant } from './variants'

/** The node types the creator may offer where it was opened, and how they divide into categories, apps and variants. */
export class CreatorCatalog {
  readonly types: readonly NodeTypeDescriptor[]

  constructor(
    types: readonly NodeTypeDescriptor[],
    readonly options: CreatorOptions,
  ) {
    this.types = types.filter((type) => this.offers(type))
  }

  triggers(): NodeTypeDescriptor[] {
    return this.types.filter((type) => type.kind === NodeKind.TRIGGER)
  }

  /** Triggers belong to their own category, every other type to its group's. */
  typesOf(category: CreatorCategory): NodeTypeDescriptor[] {
    if (category === CreatorCategory.TRIGGERS) return this.triggers()
    return this.types.filter((type) => type.kind !== NodeKind.TRIGGER && CATEGORY_OF_GROUP[type.group] === category)
  }

  /** @returns the app's triggers or its actions, by name */
  typesOfService(service: Service, scope: EntryScope): NodeTypeDescriptor[] {
    return this.types
      .filter((type) => serviceOf(type.name) === service && scopeOf(type) === scope)
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
  }

  /** @returns the ways the app's nodes of the scope are used, in display order; one or none means no split */
  variantsOf(service: Service, scope: EntryScope): AppVariant[] {
    const present = new Set(this.typesOfService(service, scope).map(variantOf))
    return VARIANT_ORDER.filter((variant) => present.has(variant))
  }

  private offers(type: NodeTypeDescriptor): boolean {
    if (type.status === NodeTypeStatus.DEPRECATED || !this.options.fits(type)) return false
    return this.options.allowTriggers || type.kind !== NodeKind.TRIGGER
  }
}

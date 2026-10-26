import { NodeGroup, NodeKind, NodeTypeStatus, type NodeTypeDescriptor } from './descriptor'

const GROUP_ORDER: readonly NodeGroup[] = [NodeGroup.CORE, NodeGroup.COMMUNICATION, NodeGroup.LOGIC, NodeGroup.DATA, NodeGroup.AI]

/** Node type descriptors by `name@version`, with the lookups the palette and canvas need. */
export class NodeTypeCatalog {
  private readonly byKey: ReadonlyMap<string, NodeTypeDescriptor>

  constructor(descriptors: readonly NodeTypeDescriptor[]) {
    this.byKey = new Map(descriptors.map((descriptor) => [descriptor.key, descriptor]))
  }

  get(key: string): NodeTypeDescriptor | undefined {
    return this.byKey.get(key)
  }

  all(): NodeTypeDescriptor[] {
    return [...this.byKey.values()]
  }

  isTrigger(key: string): boolean {
    return this.byKey.get(key)?.kind === NodeKind.TRIGGER
  }

  /**
   * @param query case-insensitive text matched against display name, description and type name
   * @returns non-deprecated types grouped in palette order, each group sorted by display name
   */
  grouped(query = ''): Array<{ group: NodeGroup; types: NodeTypeDescriptor[] }> {
    const needle = query.trim().toLowerCase()
    const matches = this.all().filter(
      (type) =>
        type.status !== NodeTypeStatus.DEPRECATED &&
        (!needle || [type.displayName, type.description, type.name].some((text) => text.toLowerCase().includes(needle))),
    )
    return GROUP_ORDER.map((group) => ({
      group,
      types: matches.filter((type) => type.group === group).sort((a, b) => a.displayName.localeCompare(b.displayName)),
    })).filter((entry) => entry.types.length > 0)
  }
}

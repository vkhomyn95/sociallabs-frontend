import { NodeKind, type NodeTypeDescriptor } from './descriptor'

/** Node type descriptors by `name@version`, with the lookups the node creator and canvas need. */
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
}

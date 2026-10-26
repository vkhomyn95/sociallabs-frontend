import { connectionKey, type ConnectionModel, type NodeId } from './model'

/** Connections by key with per-node lookups, so removing a node does not scan the whole graph. */
export class ConnectionIndex {
  private readonly byKey = new Map<string, ConnectionModel>()
  private readonly byNode = new Map<NodeId, Set<string>>()

  get size(): number {
    return this.byKey.size
  }

  has(key: string): boolean {
    return this.byKey.has(key)
  }

  get(key: string): ConnectionModel | undefined {
    return this.byKey.get(key)
  }

  all(): IterableIterator<ConnectionModel> {
    return this.byKey.values()
  }

  add(connection: ConnectionModel): string {
    const key = connectionKey(connection)
    this.byKey.set(key, connection)
    this.link(connection.source, key)
    this.link(connection.target, key)
    return key
  }

  remove(key: string): ConnectionModel | undefined {
    const connection = this.byKey.get(key)
    if (!connection) return undefined
    this.byKey.delete(key)
    this.byNode.get(connection.source)?.delete(key)
    this.byNode.get(connection.target)?.delete(key)
    return connection
  }

  /** @returns connections that start or end at the node */
  touching(nodeId: NodeId): ConnectionModel[] {
    return [...(this.byNode.get(nodeId) ?? [])].map((key) => this.byKey.get(key)!)
  }

  /** @returns connections ending at the node */
  incoming(nodeId: NodeId): ConnectionModel[] {
    return this.touching(nodeId).filter((connection) => connection.target === nodeId)
  }

  /** @returns connections starting at the node */
  outgoing(nodeId: NodeId): ConnectionModel[] {
    return this.touching(nodeId).filter((connection) => connection.source === nodeId)
  }

  clear(): void {
    this.byKey.clear()
    this.byNode.clear()
  }

  private link(nodeId: NodeId, key: string): void {
    let keys = this.byNode.get(nodeId)
    if (!keys) {
      keys = new Set()
      this.byNode.set(nodeId, keys)
    }
    keys.add(key)
  }
}

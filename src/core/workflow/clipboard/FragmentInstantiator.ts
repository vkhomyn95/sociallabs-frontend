import { takenNodeNames, uniqueName } from '../graph'
import type { ConnectionModel, NodeId, NodeModel, Position } from '../model'
import type { WorkflowDocument } from '../WorkflowDocument'
import { renameNodeReferences, type NodeRenames } from './nodeReferences'
import { applyPasteRules, DEFAULT_PASTE_RULES, type PasteRule } from './pasteRules'
import { translate, translationFor, type Placement } from './placement'
import type { WorkflowFragment } from './WorkflowFragment'

/** Nodes and connections ready to be added to the document, all with fresh ids. */
export interface PastedGraph {
  readonly nodes: readonly NodeModel[]
  readonly connections: readonly ConnectionModel[]
}

export interface InstantiatorOptions {
  readonly newId: () => NodeId
  readonly rules?: readonly PasteRule[]
}

/**
 * Turns a fragment into new nodes for a document: fresh ids, names unique in the document, references between
 * the pasted nodes kept pointing at each other, positions moved as placed, and type-specific paste rules applied.
 */
export class FragmentInstantiator {
  private readonly rules: readonly PasteRule[]

  constructor(private readonly options: InstantiatorOptions) {
    this.rules = options.rules ?? DEFAULT_PASTE_RULES
  }

  /**
   * @param fragment  what was copied
   * @param doc       document the copy goes into (for taken names)
   * @param placement where the copy goes
   * @returns the graph to add; empty for an empty fragment
   */
  instantiate(fragment: WorkflowFragment, doc: WorkflowDocument, placement: Placement): PastedGraph {
    const ids = this.newIds(fragment.nodes)
    const names = this.newNames(fragment.nodes, doc)
    const context: CopyContext = {
      ids,
      names,
      renames: renamesOf(fragment.nodes, names),
      shift: translationFor(fragment.nodes, placement),
    }
    const nodes = fragment.nodes.map((node) => this.copyNode(node, context))
    const connections = fragment.connections
      .filter((connection) => ids.has(connection.source) && ids.has(connection.target))
      .map((connection) => this.copyConnection(connection, ids))
    return { nodes, connections }
  }

  private newIds(nodes: readonly NodeModel[]): ReadonlyMap<NodeId, NodeId> {
    return new Map(nodes.map((node) => [node.id, this.options.newId()]))
  }

  /** Names are picked in fragment order, so each copy also avoids the names given to the copies before it. */
  private newNames(nodes: readonly NodeModel[], doc: WorkflowDocument): ReadonlyMap<NodeId, string> {
    const taken = takenNodeNames(doc)
    const names = new Map<NodeId, string>()
    nodes.forEach((node) => {
      const name = uniqueName(taken, node.name)
      taken.add(name)
      names.set(node.id, name)
    })
    return names
  }

  private copyNode(node: NodeModel, context: CopyContext): NodeModel {
    const copy: NodeModel = {
      ...node,
      id: context.ids.get(node.id)!,
      name: context.names.get(node.id)!,
      position: translate(node.position, context.shift),
      parameters: renameNodeReferences(node.parameters, context.renames),
    }
    return applyPasteRules(copy, this.rules)
  }

  private copyConnection(connection: ConnectionModel, ids: ReadonlyMap<NodeId, NodeId>): ConnectionModel {
    return { ...connection, source: ids.get(connection.source)!, target: ids.get(connection.target)! }
  }
}

/** What every copied node of one paste shares. */
interface CopyContext {
  readonly ids: ReadonlyMap<NodeId, NodeId>
  readonly names: ReadonlyMap<NodeId, string>
  /** Only names that changed, so parameters of nodes that kept their names are not rebuilt. */
  readonly renames: NodeRenames
  readonly shift: Position
}

/** @returns old name → new name of the nodes whose name changed */
function renamesOf(nodes: readonly NodeModel[], names: ReadonlyMap<NodeId, string>): NodeRenames {
  const renames = new Map<string, string>()
  nodes.forEach((node) => {
    const name = names.get(node.id)!
    if (name !== node.name) renames.set(node.name, name)
  })
  return renames
}

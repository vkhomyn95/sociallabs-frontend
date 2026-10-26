import type { CompletionSample } from '@/core/expression/completions'
import { upstreamOf } from '@/core/workflow/graph'
import type { ConnectionModel, NodeId, NodeModel } from '@/core/workflow/model'
import type { WorkflowDocument } from '@/core/workflow/WorkflowDocument'
import type { ItemJson, NodeRunRecord, RunData, RunItem } from './types'

/** Items that reached one input of a node over one connection. */
export interface InputSource {
  readonly connection: ConnectionModel
  readonly source: NodeModel
  readonly items: readonly RunItem[]
}

/** Upstream output as sent with an expression preview. */
export interface NodeSample {
  readonly id: NodeId
  readonly name: string
  readonly ports: ItemJson[][]
}

/** Limits that keep preview requests small for nodes with many items. */
const PREVIEW_ITEMS = 100

/**
 * Read model over the run data of one execution, in terms of the current document: what a node received
 * on its inputs and what it emitted. Nodes added after the run simply have no data; connections are taken
 * from the document, so the view follows edits made since.
 */
export class RunDataView {
  constructor(
    private readonly doc: WorkflowDocument,
    private readonly data: RunData,
  ) {}

  record(nodeId: NodeId): NodeRunRecord | undefined {
    return this.data.nodes[nodeId]
  }

  /** @returns items per output port, empty when the node did not run */
  output(nodeId: NodeId): readonly (readonly RunItem[])[] {
    return this.record(nodeId)?.output ?? []
  }

  /** @returns one source per incoming connection whose source node ran, in connection order */
  inputs(nodeId: NodeId): InputSource[] {
    return this.doc.incoming(nodeId).flatMap((connection) => {
      const record = this.record(connection.source)
      const source = this.doc.node(connection.source)
      if (!record || !source) return []
      return [{ connection, source, items: record.output[connection.sourceOutput] ?? [] }]
    })
  }

  /** Upstream nodes that ran, nearest first, for `$node[...]` previews and completions. */
  upstream(nodeId: NodeId): NodeSample[] {
    return upstreamOf(this.doc, nodeId).flatMap((id) => {
      const record = this.record(id)
      const node = this.doc.node(id)
      if (!record || !node) return []
      return [{ id, name: node.name, ports: record.output.map((port) => port.slice(0, PREVIEW_ITEMS).map((item) => item.json)) }]
    })
  }

  /** Data the expression completions of a node are derived from. */
  completionSample(nodeId: NodeId, itemIndex = 0): CompletionSample {
    const items = this.inputs(nodeId)[0]?.items ?? []
    return {
      json: items[itemIndex]?.json ?? items[0]?.json ?? {},
      nodes: new Map(this.upstream(nodeId).map((node) => [node.name, node.ports[0]?.[0] ?? {}])),
    }
  }

  /** Input items of a node as an expression preview sees them (first input, first connection). */
  previewInput(nodeId: NodeId): ItemJson[] {
    return (this.inputs(nodeId)[0]?.items ?? []).slice(0, PREVIEW_ITEMS).map((item) => item.json)
  }
}

/** Empty run data, for an editor that has not seen an execution yet. */
export const NO_RUN_DATA: RunData = Object.freeze({ version: 1, nodes: {} })

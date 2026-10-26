import type { DataPath } from '@/core/expression/paths'
import type { RunItem } from '@/core/execution/types'

/** Items of one output port as a panel shows them. */
export interface RunPort {
  readonly label: string
  readonly items: readonly RunItem[]
}

/** One selectable data source of a panel: a node's output, or what arrived over one input connection. */
export interface RunSource {
  readonly key: string
  readonly label: string
  readonly ports: readonly RunPort[]
  /** Expression for a field of this source when dragged into a parameter; absent for non-mappable data. */
  readonly mapping?: (path: DataPath) => string
}

/** Drag data of a mapped field; plain text, so it can also be dropped into any text input. */
export const MAPPING_FORMAT = 'text/plain'

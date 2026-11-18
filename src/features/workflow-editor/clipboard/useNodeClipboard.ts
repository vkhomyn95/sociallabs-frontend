import { slbToast } from '@sociallabs/frontend-components'
import type { WorkflowView } from '@/core/editor/WorkflowView'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import {
  decodeFragment,
  encodeFragment,
  extractFragment,
  filterFragment,
  placeAt,
  type Placement,
  type WorkflowFragment,
} from '@/core/workflow/clipboard'
import { typeKeyOf, type NodeId, type NodeModel } from '@/core/workflow/model'
import type { CanvasSelection } from '../canvas/useCanvasSelection'
import { ClipboardMessages } from './clipboardMessages'
import { systemClipboard, type SystemClipboard } from './SystemClipboard'

export interface NodeClipboardDeps {
  readonly view: WorkflowView
  readonly catalog: NodeTypeCatalog
  readonly selection: CanvasSelection
  readonly clipboard?: SystemClipboard
}

/**
 * Copy, cut, paste and duplicate of canvas nodes, like in n8n. Copy works in a read-only view too; the other
 * actions need commands. Synchronous variants serve the keyboard clipboard events, async ones the context menu.
 */
export function useNodeClipboard(deps: NodeClipboardDeps) {
  const { view, catalog, selection } = deps
  const clipboard = deps.clipboard ?? systemClipboard
  const commands = view.commands

  /** @returns clipboard text of the nodes, or null when none of them exists */
  function encodeNodes(ids: readonly NodeId[]): { text: string; count: number } | null {
    const fragment = extractFragment(view.document, ids)
    return fragment ? { text: encodeFragment(fragment), count: fragment.nodes.length } : null
  }

  /** Copy for a `copy` event: the browser writes the returned text. */
  function copySelection(): string | null {
    const encoded = encodeNodes(selection.selectedNodeIds())
    if (!encoded) return null
    clipboard.remember(encoded.text)
    slbToast.success(ClipboardMessages.copied(encoded.count))
    return encoded.text
  }

  /** Cut for a `cut` event: copy, then delete the nodes as one undo step. */
  function cutSelection(): string | null {
    if (!commands) return null
    const ids = selection.selectedNodeIds()
    const encoded = encodeNodes(ids)
    if (!encoded) return null
    clipboard.remember(encoded.text)
    commands.remove(ids)
    slbToast.success(ClipboardMessages.cut(encoded.count))
    return encoded.text
  }

  /** Copy from the context menu, which has no clipboard event and so writes through the Clipboard API. */
  async function copyNodes(ids: readonly NodeId[]): Promise<void> {
    const encoded = encodeNodes(ids)
    if (!encoded) return
    const written = await clipboard.write(encoded.text)
    if (written) slbToast.success(ClipboardMessages.copied(encoded.count))
    else slbToast.warning(ClipboardMessages.copyFailed)
  }

  async function cutNodes(ids: readonly NodeId[]): Promise<void> {
    if (!commands || !encodeNodes(ids)) return
    await copyNodes(ids)
    commands.remove(ids)
  }

  /** Drop nodes of types this editor cannot render or run, and say so. */
  function knownOnly(fragment: WorkflowFragment): WorkflowFragment {
    const known = filterFragment(fragment, (node) => catalog.get(typeKeyOf(node)) !== undefined)
    const skipped = fragment.nodes.length - known.nodes.length
    if (skipped) slbToast.warning(ClipboardMessages.unknownTypes(skipped))
    return known
  }

  /** Add the pasted copies and make them the selection, so they can be moved or deleted right away. */
  function insert(fragment: WorkflowFragment, placement: Placement): NodeModel[] {
    if (!commands) return []
    const pasted = commands.paste(knownOnly(fragment), placement)
    if (pasted.length) selection.selectOnly(pasted.map((node) => node.id))
    return pasted
  }

  /**
   * Paste for a `paste` event.
   *
   * @returns whether the text was copied nodes; any other text is left to the browser
   */
  function pasteText(text: string, placement: Placement = placeAt(selection.pastePoint())): boolean {
    if (!commands) return false
    const fragment = decodeFragment(text)
    if (!fragment) return false
    insert(fragment, placement)
    return true
  }

  /** Paste from the context menu: reads the system clipboard, or what was copied in this tab. */
  async function pasteFromClipboard(placement: Placement = placeAt(selection.pastePoint())): Promise<void> {
    if (!commands) return
    const text = await clipboard.read()
    if (!text || !pasteText(text, placement)) slbToast.info(ClipboardMessages.nothingToPaste)
  }

  function duplicateNodes(ids: readonly NodeId[]): void {
    const copies = commands?.duplicate(ids) ?? []
    if (copies.length) selection.selectOnly(copies.map((node) => node.id))
  }

  return {
    copySelection,
    cutSelection,
    copyNodes,
    cutNodes,
    pasteText,
    pasteFromClipboard,
    duplicateNodes,
    duplicateSelection: () => duplicateNodes(selection.selectedNodeIds()),
    canPaste: () => commands !== null,
  }
}

export type NodeClipboard = ReturnType<typeof useNodeClipboard>

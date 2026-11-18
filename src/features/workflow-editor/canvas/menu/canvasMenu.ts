import type { MenuItem } from '@sociallabs/frontend-components'
import type { NodeId } from '@/core/workflow/model'
import { ShortcutLabels } from './shortcutLabels'

/** Actions of the canvas context menu; the value is the menu item key. */
export enum CanvasMenuAction {
  OPEN = 'OPEN',
  COPY = 'COPY',
  CUT = 'CUT',
  PASTE = 'PASTE',
  DUPLICATE = 'DUPLICATE',
  TOGGLE_DISABLED = 'TOGGLE_DISABLED',
  SELECT_ALL = 'SELECT_ALL',
  ADD_NODE = 'ADD_NODE',
  DELETE = 'DELETE',
}

/** What was right-clicked: one or more nodes, or the empty pane. */
export interface CanvasMenuContext {
  /** Nodes the actions apply to; empty for the pane. */
  readonly nodeIds: readonly NodeId[]
  readonly readonly: boolean
  /** Whether every node of the context is disabled, so the toggle enables them. */
  readonly allDisabled: boolean
}

const DIVIDER = (key: string): MenuItem => ({ key, type: 'divider' })

const isAction = (key: string): key is CanvasMenuAction => Object.values<string>(CanvasMenuAction).includes(key)

/** @returns the action of a selected menu item, or null for a key that is not one */
export const actionOf = (item: MenuItem): CanvasMenuAction | null => (isAction(item.key) ? item.key : null)

function nodeItems(context: CanvasMenuContext): MenuItem[] {
  const single = context.nodeIds.length === 1
  const editable = !context.readonly
  const items: MenuItem[] = []
  if (single) items.push({ key: CanvasMenuAction.OPEN, label: 'Open', icon: 'action_edit', shortcut: ShortcutLabels.open })
  items.push({ key: CanvasMenuAction.COPY, label: 'Copy', icon: 'action_copy', shortcut: ShortcutLabels.copy })
  if (!editable) return items
  items.push(
    { key: CanvasMenuAction.CUT, label: 'Cut', shortcut: ShortcutLabels.cut },
    { key: CanvasMenuAction.DUPLICATE, label: 'Duplicate', shortcut: ShortcutLabels.duplicate },
    { key: CanvasMenuAction.PASTE, label: 'Paste', shortcut: ShortcutLabels.paste },
    DIVIDER('nodes-state'),
    {
      key: CanvasMenuAction.TOGGLE_DISABLED,
      label: context.allDisabled ? 'Activate' : 'Deactivate',
      icon: context.allDisabled ? 'visibility_on' : 'visibility_off',
    },
    DIVIDER('nodes-danger'),
    { key: CanvasMenuAction.DELETE, label: 'Delete', icon: 'action_trash', shortcut: ShortcutLabels.delete, danger: true },
  )
  return items
}

function paneItems(context: CanvasMenuContext): MenuItem[] {
  const selectAll: MenuItem = { key: CanvasMenuAction.SELECT_ALL, label: 'Select all', shortcut: ShortcutLabels.selectAll }
  if (context.readonly) return [selectAll]
  return [
    { key: CanvasMenuAction.ADD_NODE, label: 'Add node', icon: 'action_plus', shortcut: ShortcutLabels.addNode },
    { key: CanvasMenuAction.PASTE, label: 'Paste', shortcut: ShortcutLabels.paste },
    DIVIDER('pane-select'),
    selectAll,
  ]
}

/**
 * Items of the canvas context menu, like n8n's: node actions for a node or a selection, canvas actions for the pane.
 * A read-only view offers only what does not change the workflow.
 */
export function canvasMenuItems(context: CanvasMenuContext): MenuItem[] {
  return context.nodeIds.length ? nodeItems(context) : paneItems(context)
}

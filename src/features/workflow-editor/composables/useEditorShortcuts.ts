import { onBeforeUnmount, onMounted } from 'vue'
import { isCanvasInput } from './editorFocus'

export interface EditorShortcuts {
  undo(): void
  redo(): void
  save(): void
  deleteSelection(): void
  addNode(): void
  duplicateSelection(): void
  selectAll(): void
}

type Shortcut = () => void

/** @returns the shortcut a key press stands for, or null */
function shortcutFor(event: KeyboardEvent, shortcuts: EditorShortcuts): Shortcut | null {
  const key = event.key.toLowerCase()
  if (event.ctrlKey || event.metaKey) return modifiedShortcut(key, event.shiftKey, shortcuts)
  if (key === 'delete' || key === 'backspace') return shortcuts.deleteSelection
  if (key === 'tab' && !event.shiftKey) return shortcuts.addNode
  return null
}

/** @returns the shortcut of Ctrl/Cmd plus the key, or null */
function modifiedShortcut(key: string, shift: boolean, shortcuts: EditorShortcuts): Shortcut | null {
  switch (key) {
    case 'z':
      return shift ? shortcuts.redo : shortcuts.undo
    case 'y':
      return shortcuts.redo
    case 's':
      return shortcuts.save
    case 'd':
      return shortcuts.duplicateSelection
    case 'a':
      return shortcuts.selectAll
    default:
      return null
  }
}

/**
 * Editor keyboard shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo, Ctrl/Cmd+S save,
 * Ctrl/Cmd+D duplicate, Ctrl/Cmd+A select all, Delete/Backspace delete the selection, Tab opens the node creator.
 * Copy, cut and paste come as clipboard events instead, see useClipboardEvents. Ignored while typing in a field
 * or when a dialog is open.
 */
export function useEditorShortcuts(shortcuts: EditorShortcuts): void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (!isCanvasInput(event)) return
    const action = shortcutFor(event, shortcuts)
    if (!action) return
    event.preventDefault()
    action()
  }
  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}

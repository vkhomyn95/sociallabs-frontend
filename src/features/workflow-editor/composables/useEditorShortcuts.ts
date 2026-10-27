import { onBeforeUnmount, onMounted } from 'vue'

export interface EditorShortcuts {
  undo(): void
  redo(): void
  save(): void
  deleteSelection(): void
  addNode(): void
}

const isTyping = (target: EventTarget | null): boolean =>
  target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))

/**
 * Editor keyboard shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl+Y redo, Ctrl/Cmd+S save,
 * Delete/Backspace delete the selection, Tab opens the node creator. Ignored while typing in a field or when a
 * dialog is open.
 */
export function useEditorShortcuts(shortcuts: EditorShortcuts): void {
  const onKeyDown = (event: KeyboardEvent) => {
    if (isTyping(event.target) || document.querySelector('[aria-modal="true"]')) return
    const mod = event.ctrlKey || event.metaKey
    const key = event.key.toLowerCase()
    const action =
      mod && key === 'z' ? (event.shiftKey ? shortcuts.redo : shortcuts.undo)
      : mod && key === 'y' ? shortcuts.redo
      : mod && key === 's' ? shortcuts.save
      : !mod && (key === 'delete' || key === 'backspace') ? shortcuts.deleteSelection
      : !mod && !event.shiftKey && key === 'tab' ? shortcuts.addNode
      : null
    if (!action) return
    event.preventDefault()
    action()
  }
  onMounted(() => window.addEventListener('keydown', onKeyDown))
  onBeforeUnmount(() => window.removeEventListener('keydown', onKeyDown))
}

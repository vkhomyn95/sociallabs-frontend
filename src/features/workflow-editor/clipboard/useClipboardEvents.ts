import { onBeforeUnmount, onMounted } from 'vue'
import { hasTextSelection, isCanvasInput } from '../composables/editorFocus'

/** Clipboard handlers of the canvas; each returns whether it handled the event (so the browser default is kept otherwise). */
export interface ClipboardEventHandlers {
  /** @returns the text to put on the clipboard, or null to leave the copy to the browser */
  copy(): string | null
  /** @returns the text to put on the clipboard, or null to leave the cut to the browser */
  cut(): string | null
  /** @returns whether the pasted text was taken as nodes */
  paste(text: string): boolean
}

const TEXT = 'text/plain'

/**
 * Keyboard copy, cut and paste (Ctrl/Cmd+C, X, V) through the window's clipboard events, which carry the clipboard
 * data without a permission prompt. Fields, dialogs and selected page text keep the browser's own behaviour.
 */
export function useClipboardEvents(handlers: ClipboardEventHandlers): void {
  const belongsToCanvas = (event: ClipboardEvent): boolean => isCanvasInput(event) && !hasTextSelection()

  function write(event: ClipboardEvent, text: string | null): void {
    if (text === null || !event.clipboardData) return
    event.clipboardData.setData(TEXT, text)
    event.preventDefault()
  }

  const onCopy = (event: ClipboardEvent): void => {
    if (belongsToCanvas(event)) write(event, handlers.copy())
  }

  const onCut = (event: ClipboardEvent): void => {
    if (belongsToCanvas(event)) write(event, handlers.cut())
  }

  const onPaste = (event: ClipboardEvent): void => {
    if (!isCanvasInput(event)) return
    const text = event.clipboardData?.getData(TEXT)
    if (text && handlers.paste(text)) event.preventDefault()
  }

  onMounted(() => {
    window.addEventListener('copy', onCopy)
    window.addEventListener('cut', onCut)
    window.addEventListener('paste', onPaste)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('copy', onCopy)
    window.removeEventListener('cut', onCut)
    window.removeEventListener('paste', onPaste)
  })
}

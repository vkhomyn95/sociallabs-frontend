/** @returns whether the event target is a field the user types into, where editor shortcuts must not fire */
export function isTyping(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/** @returns whether a modal dialog is open over the editor */
export function isDialogOpen(): boolean {
  return document.querySelector('[aria-modal="true"]') !== null
}

/** @returns whether the user has selected page text, which a copy must copy instead of nodes */
export function hasTextSelection(): boolean {
  const selection = window.getSelection()
  return selection !== null && !selection.isCollapsed && selection.toString().length > 0
}

/** @returns whether keyboard input of the event belongs to the canvas rather than a field or a dialog */
export function isCanvasInput(event: Event): boolean {
  return !isTyping(event.target) && !isDialogOpen()
}

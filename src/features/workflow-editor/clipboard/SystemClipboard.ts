/**
 * Text clipboard for copied nodes. Writes go to the system clipboard, so nodes can be pasted into another tab or
 * shared as text; the last written text is also kept in memory, so the context menu's Paste still works where the
 * browser refuses to read the system clipboard (no permission, or not a secure context).
 *
 * Keyboard copy and paste do not need this API at all: they use the `copy` / `paste` events, which carry the
 * clipboard data without asking for permission.
 */
export class SystemClipboard {
  private lastWritten: string | null = null

  /**
   * @param text text to put on the clipboard
   * @returns whether the system clipboard took it (the in-memory copy is kept either way)
   */
  async write(text: string): Promise<boolean> {
    this.lastWritten = text
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }

  /** Remember text the browser already put on the system clipboard, e.g. in a `copy` event. */
  remember(text: string): void {
    this.lastWritten = text
  }

  /** @returns clipboard text, the system one when readable, otherwise what was last copied in this tab */
  async read(): Promise<string | null> {
    try {
      return await navigator.clipboard.readText()
    } catch {
      return this.lastWritten
    }
  }

  /** @returns whether something was copied in this tab, i.e. whether Paste certainly has text to try */
  get hasLocalText(): boolean {
    return this.lastWritten !== null
  }
}

/** One clipboard for all editors of the tab, so nodes copied in one workflow paste into another. */
export const systemClipboard = new SystemClipboard()

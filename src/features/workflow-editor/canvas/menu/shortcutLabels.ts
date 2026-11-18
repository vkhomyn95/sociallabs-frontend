/** Key hints shown next to menu items, in the platform's notation (⌘ on Apple devices, Ctrl elsewhere). */

const isApple = (): boolean => /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)

const withMod = (key: string): string => (isApple() ? `⌘${key}` : `Ctrl+${key}`)

export const ShortcutLabels = {
  copy: withMod('C'),
  cut: withMod('X'),
  paste: withMod('V'),
  duplicate: withMod('D'),
  selectAll: withMod('A'),
  delete: 'Del',
  addNode: 'Tab',
  open: '↵',
} as const

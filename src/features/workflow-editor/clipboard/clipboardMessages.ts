/** Toast texts of clipboard actions. */

const nodesLabel = (count: number): string => (count === 1 ? '1 node' : `${count} nodes`)

export const ClipboardMessages = {
  copied: (count: number): string => `Copied ${nodesLabel(count)}`,
  cut: (count: number): string => `Cut ${nodesLabel(count)}`,
  copyFailed: 'Could not copy to the clipboard; Paste still works in this tab',
  nothingToPaste: 'The clipboard holds no copied nodes',
  unknownTypes: (count: number): string => `${nodesLabel(count)} of types this editor does not know were skipped`,
} as const

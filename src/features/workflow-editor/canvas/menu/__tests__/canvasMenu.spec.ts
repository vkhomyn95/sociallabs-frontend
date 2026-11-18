import { describe, expect, it } from 'vitest'
import { actionOf, CanvasMenuAction, canvasMenuItems } from '../canvasMenu'

const keysOf = (nodeIds: string[], readonly = false, allDisabled = false): string[] =>
  canvasMenuItems({ nodeIds, readonly, allDisabled })
    .filter((item) => item.type !== 'divider')
    .map((item) => item.key)

describe('canvasMenuItems', () => {
  it('offers node actions for one node, with Open', () => {
    expect(keysOf(['a'])).toEqual([
      CanvasMenuAction.OPEN,
      CanvasMenuAction.COPY,
      CanvasMenuAction.CUT,
      CanvasMenuAction.DUPLICATE,
      CanvasMenuAction.PASTE,
      CanvasMenuAction.TOGGLE_DISABLED,
      CanvasMenuAction.DELETE,
    ])
  })

  it('has no Open for a selection of several nodes', () => {
    expect(keysOf(['a', 'b'])).not.toContain(CanvasMenuAction.OPEN)
  })

  it('offers only copy and open in a read-only view', () => {
    expect(keysOf(['a'], true)).toEqual([CanvasMenuAction.OPEN, CanvasMenuAction.COPY])
    expect(keysOf([], true)).toEqual([CanvasMenuAction.SELECT_ALL])
  })

  it('offers canvas actions for the pane', () => {
    expect(keysOf([])).toEqual([CanvasMenuAction.ADD_NODE, CanvasMenuAction.PASTE, CanvasMenuAction.SELECT_ALL])
  })

  it('labels the toggle by the state of the nodes', () => {
    const toggle = (allDisabled: boolean) =>
      canvasMenuItems({ nodeIds: ['a'], readonly: false, allDisabled }).find((i) => i.key === CanvasMenuAction.TOGGLE_DISABLED)
    expect(toggle(false)!.label).toBe('Deactivate')
    expect(toggle(true)!.label).toBe('Activate')
  })

  it('maps only action keys to actions', () => {
    expect(actionOf({ key: CanvasMenuAction.COPY })).toBe(CanvasMenuAction.COPY)
    expect(actionOf({ key: 'nodes-state', type: 'divider' })).toBeNull()
  })
})

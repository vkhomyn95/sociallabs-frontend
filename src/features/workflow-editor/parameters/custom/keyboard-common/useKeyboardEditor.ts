import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { MOVE_DIRECTIONS, type AddTarget, type ButtonKind, type LayoutChange, type MoveDirection } from './keyboardLayout'

export interface KeyboardEditorState<B> {
  /** Index of the picked button in the flat list, null when none is picked. */
  readonly selected: Ref<number | null>
  readonly selectedButton: ComputedRef<B | null>
  readonly movable: ComputedRef<Readonly<Record<MoveDirection, boolean>>>
  select(index: number): void
  add(target: AddTarget): void
  update(button: B): void
  move(direction: MoveDirection): void
  remove(): void
}

/**
 * Editing state of one keyboard: the picked button, and changes that commit a new flat list through the kind's layout
 * and keep the pick on the button that changed.
 */
export function useKeyboardEditor<B>(
  buttons: () => readonly B[],
  kind: () => ButtonKind<B>,
  commit: (buttons: B[]) => void,
): KeyboardEditorState<B> {
  const selected = ref<number | null>(null)

  /** The pick, unless the list changed under it. */
  const current = (): number | null => {
    const index = selected.value
    return index !== null && index < buttons().length ? index : null
  }

  const selectedButton = computed(() => {
    const index = current()
    return index === null ? null : buttons()[index]!
  })

  const movable = computed(() => {
    const index = current()
    const entries = MOVE_DIRECTIONS.map((direction) => [direction, canMove(index, direction)])
    return Object.fromEntries(entries) as Record<MoveDirection, boolean>
  })

  function canMove(index: number | null, direction: MoveDirection): boolean {
    return index !== null && kind().layout.canMove(buttons(), index, direction)
  }

  function apply(change: LayoutChange<B>): void {
    commit(change.buttons)
    selected.value = change.selected
  }

  function add(target: AddTarget): void {
    const button = kind().newButton(buttons().length + 1)
    apply(kind().layout.add(buttons(), button, target))
  }

  function update(button: B): void {
    const index = current()
    if (index === null) return
    commit(buttons().map((existing, i) => (i === index ? button : existing)))
  }

  function move(direction: MoveDirection): void {
    const index = current()
    if (index !== null) apply(kind().layout.move(buttons(), index, direction))
  }

  function remove(): void {
    const index = current()
    if (index === null) return
    apply({ buttons: kind().layout.remove(buttons(), index), selected: null })
  }

  return {
    selected,
    selectedButton,
    movable,
    select: (index) => (selected.value = index),
    add,
    update,
    move,
    remove,
  }
}

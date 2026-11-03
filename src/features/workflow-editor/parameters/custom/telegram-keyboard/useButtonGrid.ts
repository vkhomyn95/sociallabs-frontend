import { computed, ref, type ComputedRef, type Ref } from 'vue'
import { ButtonGrid, MoveDirection, type GridChange, type GridPosition, type RowButton } from './buttonGrid'
import type { ButtonKind } from './buttonKinds'

export interface ButtonGridState<B extends RowButton> {
  readonly grid: ComputedRef<ButtonGrid<B>>
  readonly selected: Ref<GridPosition | null>
  readonly selectedButton: ComputedRef<B | null>
  /** Index of the selected button in the flat list, for validation paths. */
  readonly selectedIndex: ComputedRef<number>
  readonly movable: ComputedRef<Readonly<Record<MoveDirection, boolean>>>
  select(position: GridPosition): void
  append(row: number): void
  appendRow(): void
  update(button: B): void
  move(direction: MoveDirection): void
  remove(): void
}

const DIRECTIONS = Object.values(MoveDirection)

/**
 * Editing state of one keyboard: the grid built from the flat list of buttons, the selected button, and changes that
 * commit a new flat list and keep the selection on the button that changed.
 */
export function useButtonGrid<B extends RowButton>(
  buttons: () => readonly B[],
  kind: ButtonKind<B>,
  commit: (buttons: B[]) => void,
): ButtonGridState<B> {
  const grid = computed(() => ButtonGrid.fromButtons(buttons()))
  const selected = ref<GridPosition | null>(null)

  const current = (): GridPosition | null => (grid.value.has(selected.value) ? selected.value : null)

  const selectedButton = computed(() => {
    const position = current()
    return position ? grid.value.at(position)! : null
  })

  const selectedIndex = computed(() => {
    const position = current()
    return position ? grid.value.indexOf(position) : -1
  })

  const movable = computed(() => {
    const position = current()
    const entries = DIRECTIONS.map((direction) => [direction, !!position && grid.value.canMove(position, direction)])
    return Object.fromEntries(entries) as Record<MoveDirection, boolean>
  })

  function apply(change: GridChange<B>): void {
    commit(change.grid.toButtons())
    selected.value = change.position
  }

  const next = (): B => kind.newButton(buttons().length + 1)

  function update(button: B): void {
    const position = current()
    if (position) commit(grid.value.replace(position, button).toButtons())
  }

  function move(direction: MoveDirection): void {
    const position = current()
    if (position) apply(grid.value.move(position, direction))
  }

  function remove(): void {
    const position = current()
    if (!position) return
    commit(grid.value.remove(position).toButtons())
    selected.value = null
  }

  return {
    grid,
    selected,
    selectedButton,
    selectedIndex,
    movable,
    select: (position) => (selected.value = position),
    append: (row) => apply(grid.value.append(row, next())),
    appendRow: () => apply(grid.value.appendRow(next())),
    update,
    move,
    remove,
  }
}

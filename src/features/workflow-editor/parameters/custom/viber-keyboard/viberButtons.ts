import { isRecord } from '@/core/node-types/parameters'
import type { ViberButton } from './viberKeyboard.types'

/** @returns the buttons of a saved list, skipping anything that is not a button (an expression, a stray value) */
export function buttonsOf(value: unknown): ViberButton[] {
  return Array.isArray(value) ? (value.filter(isRecord) as ViberButton[]) : []
}

/** @returns the values with the list of buttons set, or without the key when the list is empty */
export function withButtons(values: Readonly<Record<string, unknown>>, key: string, buttons: readonly ViberButton[]): Record<string, unknown> {
  const next: Record<string, unknown> = { ...values }
  if (buttons.length) next[key] = buttons
  else delete next[key]
  return next
}

/** @returns a whole number of grid cells between 1 and `max`, `max` when the value is not a number (an expression) */
export function cellsOf(value: unknown, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return max
  return Math.min(Math.max(Math.trunc(value), 1), max)
}

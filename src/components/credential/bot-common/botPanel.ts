import type { BadgeColor } from '@sociallabs/frontend-components'

/** How a bot's delivery status shows: a badge, and what it means when the server gives no message of its own. */
export interface BotStatusUi {
  readonly label: string
  readonly color: BadgeColor
  readonly hint: string
}

/** A counter of the bot's panel, in the order shown. */
export interface CounterItem<K extends string> {
  readonly key: K
  readonly label: string
}

/** @returns a date and time in the user's locale, a dash for none */
export function formatMoment(iso: string | null | undefined): string {
  return iso ? new Date(iso).toLocaleString() : '—'
}

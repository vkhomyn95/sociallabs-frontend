import type { BadgeColor, SlbIconName } from '@sociallabs/frontend-components'
import { ExecutionMode, ExecutionStatus } from '@/core/execution/types'

export interface StatusPresentation {
  readonly label: string
  readonly color: BadgeColor
  readonly icon: SlbIconName
}

export const STATUS: Readonly<Record<ExecutionStatus, StatusPresentation>> = {
  [ExecutionStatus.NEW]: { label: 'New', color: 'gray', icon: 'object_clock' },
  [ExecutionStatus.QUEUED]: { label: 'Queued', color: 'gray', icon: 'object_clock' },
  [ExecutionStatus.RUNNING]: { label: 'Running', color: 'primary', icon: 'shape_spinner' },
  [ExecutionStatus.WAITING]: { label: 'Waiting', color: 'warning', icon: 'object_clock' },
  [ExecutionStatus.SUCCESS]: { label: 'Succeeded', color: 'success', icon: 'status_success' },
  [ExecutionStatus.ERROR]: { label: 'Failed', color: 'error', icon: 'status_error' },
  [ExecutionStatus.CANCELED]: { label: 'Canceled', color: 'gray', icon: 'action_minus' },
}

export const MODE: Readonly<Record<ExecutionMode, string>> = {
  [ExecutionMode.TRIGGER]: 'Trigger',
  [ExecutionMode.MANUAL]: 'Manual',
  [ExecutionMode.RETRY]: 'Retry',
}

/** @returns `850 ms`, `2.4 s`, `3 min 5 s`; a dash while running */
export function formatDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1000) return `${ms} ms`
  if (ms < 60_000) return `${(ms / 1000).toFixed(ms < 10_000 ? 1 : 0)} s`
  const minutes = Math.floor(ms / 60_000)
  const seconds = Math.round((ms % 60_000) / 1000)
  return seconds ? `${minutes} min ${seconds} s` : `${minutes} min`
}

const TIME = new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })
const DATE_TIME = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })

/** @returns the time alone for today, date and time otherwise */
export function formatStarted(iso: string, now = new Date()): string {
  const date = new Date(iso)
  return date.toDateString() === now.toDateString() ? TIME.format(date) : DATE_TIME.format(date)
}

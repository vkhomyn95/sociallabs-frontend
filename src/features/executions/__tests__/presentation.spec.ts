import { describe, expect, it } from 'vitest'
import { formatDuration, formatStarted } from '../presentation'

describe('execution presentation', () => {
  it('formats durations for people', () => {
    expect(formatDuration(null)).toBe('—')
    expect(formatDuration(850)).toBe('850 ms')
    expect(formatDuration(2400)).toBe('2.4 s')
    expect(formatDuration(42_000)).toBe('42 s')
    expect(formatDuration(185_000)).toBe('3 min 5 s')
    expect(formatDuration(120_000)).toBe('2 min')
  })

  it('shows only the time for executions of today', () => {
    const now = new Date('2026-10-26T15:00:00')
    expect(formatStarted('2026-10-26T09:05:00', now)).not.toContain('26')
    expect(formatStarted('2026-10-20T09:05:00', now)).toContain('20')
  })
})

import { describe, expect, it } from 'vitest'
import { choiceHint, choiceOptions } from '../loadedChoices'

const listed = [
  { value: 'claude-x', displayName: 'Claude X', description: 'Released 2025-09-29' },
  { value: 'gpt-y', displayName: 'gpt-y', description: '' },
]

describe('choiceOptions', () => {
  it('offers the loaded choices', () => {
    expect(choiceOptions(listed, 'gpt-y')).toEqual([
      { value: 'claude-x', label: 'Claude X' },
      { value: 'gpt-y', label: 'gpt-y' },
    ])
  })

  it('keeps a value the list does not offer, first', () => {
    expect(choiceOptions(listed, 'typed-model')[0]).toEqual({ value: 'typed-model', label: 'typed-model (not in the list)' })
    expect(choiceOptions([], undefined)).toEqual([])
  })
})

describe('choiceHint', () => {
  it('describes the chosen value, or names its id when only the label is shown', () => {
    expect(choiceHint(listed, 'claude-x')).toBe('Released 2025-09-29')
    expect(choiceHint([{ value: 'id-1', displayName: 'Model one', description: '' }], 'id-1')).toBe('id-1')
    expect(choiceHint(listed, 'gpt-y')).toBeUndefined()
    expect(choiceHint(listed, 'other')).toBeUndefined()
  })
})

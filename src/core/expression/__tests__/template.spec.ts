import { describe, expect, it } from 'vitest'
import { caretContext, isExpression, SegmentKind, splitTemplate } from '../template'

const kinds = (text: string) => splitTemplate(text).map((s) => [s.kind, s.text])

describe('splitTemplate', () => {
  it('splits like the backend parser', () => {
    expect(kinds('Hi {{ $json.name }}!')).toEqual([
      [SegmentKind.TEXT, 'Hi '],
      [SegmentKind.EXPRESSION, ' $json.name '],
      [SegmentKind.TEXT, '!'],
    ])
    expect(kinds("{{ {'a': {'b': 1}} }}"), 'nested braces').toEqual([[SegmentKind.EXPRESSION, " {'a': {'b': 1}} "]])
    expect(kinds("{{ '}}' }}"), 'braces in strings').toEqual([[SegmentKind.EXPRESSION, " '}}' "]])
    expect(kinds('a {{ b'), 'unclosed stays text').toEqual([[SegmentKind.TEXT, 'a {{ b']])
    expect(kinds(''), 'empty').toEqual([[SegmentKind.TEXT, '']])
  })

  it('keeps offsets of every segment', () => {
    const [text, expression] = splitTemplate('ab{{ x }}')
    expect([text!.start, text!.end, expression!.start, expression!.end]).toEqual([0, 2, 2, 9])
  })
})

describe('isExpression', () => {
  it('needs a complete pair', () => {
    expect(isExpression('{{ $json.a }}')).toBe(true)
    expect(isExpression('{{ open')).toBe(false)
    expect(isExpression(5)).toBe(false)
  })
})

describe('caretContext', () => {
  it('finds the expression around the caret, closed or still typed', () => {
    expect(caretContext('Hi {{ $json.na }}', 14)).toEqual({ before: ' $json.na', sourceStart: 5 })
    expect(caretContext('Hi {{ $json.', 12)).toEqual({ before: ' $json.', sourceStart: 5 })
    expect(caretContext('Hi {{ x }} there', 13)).toBeNull()
    expect(caretContext('plain', 3)).toBeNull()
  })
})

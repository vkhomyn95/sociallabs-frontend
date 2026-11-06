import { describe, expect, it } from 'vitest'
import { TemplateButtonKind, TemplateHeaderFormat } from '@/components/credential/whatsapp-bot/whatsappBot.types'
import {
  TemplateHeaderType,
  bodyValuesFor,
  buttonValuesFor,
  headerTypeOf,
  headerVariableOf,
  languageOf,
  textParts,
} from '../templateValues'
import { namedLanguage, positionalLanguage } from './templateFixtures'

describe('template values', () => {
  it('picks the node\'s language, or the first approved one when the code is an expression', () => {
    const structure = { name: 'order', languages: [namedLanguage({ approved: false }), positionalLanguage()] }
    expect(languageOf(structure, ' uk ')?.language).toBe('uk')
    expect(languageOf(structure, 'de')).toBeUndefined()
    expect(languageOf(structure, '{{ $json.lang }}')?.language).toBe('uk')
    expect(languageOf(structure, undefined)?.language).toBe('uk')
  })

  it('sends a header value only when the header has something to fill', () => {
    expect(headerTypeOf(undefined)).toBe(TemplateHeaderType.NONE)
    expect(headerTypeOf({ format: TemplateHeaderFormat.TEXT, text: 'Hi', needsValue: false })).toBe(TemplateHeaderType.NONE)
    expect(headerTypeOf(namedLanguage().header)).toBe(TemplateHeaderType.TEXT)
    expect(headerTypeOf(positionalLanguage().header)).toBe(TemplateHeaderType.IMAGE)
    expect(headerVariableOf(namedLanguage())).toBe('order')
    expect(headerVariableOf(positionalLanguage({ header: namedLanguage().header }))).toBeUndefined()
  })

  it('keeps named values by name and positional ones by position, dropping the rest', () => {
    const named = bodyValuesFor(namedLanguage(), [{ name: 'order', value: '42' }, { name: 'gone', value: 'x' }])
    expect(named).toEqual([{ name: 'name', value: '' }, { name: 'order', value: '42' }])

    const positional = bodyValuesFor(positionalLanguage(), [{ value: 'Ann' }, { value: '1234' }, { value: 'extra' }])
    expect(positional).toEqual([{ value: 'Ann' }, { value: '1234' }])
    expect(bodyValuesFor(positionalLanguage(), undefined)).toEqual([{ value: '' }, { value: '' }])
  })

  it('keeps a required button value always and an optional one only when given', () => {
    expect(buttonValuesFor(namedLanguage(), [])).toEqual([{ index: 1, type: TemplateButtonKind.URL, value: '' }])
    const given = [
      { index: 0, type: 'QUICK_REPLY', value: 'thanks' },
      { index: 1, type: 'URL', value: 'A-1' },
      { index: 2, type: 'URL', value: 'call buttons take none' },
    ]
    expect(buttonValuesFor(namedLanguage(), given)).toEqual([
      { index: 0, type: TemplateButtonKind.QUICK_REPLY, value: 'thanks' },
      { index: 1, type: TemplateButtonKind.URL, value: 'A-1' },
    ])
  })

  it('marks the variables of a text', () => {
    expect(textParts('Hi {{name}}, {{ 2 }}!')).toEqual([
      { text: 'Hi ', variable: false },
      { text: '{{name}}', variable: true },
      { text: ', ', variable: false },
      { text: '{{ 2 }}', variable: true },
      { text: '!', variable: false },
    ])
    expect(textParts(undefined)).toEqual([])
  })
})

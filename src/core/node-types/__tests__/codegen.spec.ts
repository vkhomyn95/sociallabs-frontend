import { describe, expect, it } from 'vitest'
import { generateNodeTypes, paramsTypeName } from '../codegen'
import { PropertyType } from '../descriptor'
import { nodeType, option, property } from './descriptorFixtures'

describe('generateNodeTypes', () => {
  it('names interfaces after the type and version', () => {
    expect(paramsTypeName({ name: 'telegram.accountTrigger', version: 2 })).toBe('TelegramAccountTriggerV2Params')
  })

  it('maps every property type, optionality and expressions', () => {
    const source = generateNodeTypes([
      nodeType({ properties: [] , key: 'legacy.node@1', name: 'legacy.node' }),
      nodeType({
        properties: [
          property('path', { required: true, expression: false, description: 'Public' }),
          property('count', { type: PropertyType.NUMBER }),
          property('method', { type: PropertyType.OPTIONS, options: [option('GET'), option("it's")], expression: false }),
          property('events', { type: PropertyType.MULTI_OPTIONS, options: [option('A')], expression: false }),
          property('rules', { type: PropertyType.FIXED_COLLECTION, expression: false, children: [property('value', { required: true })] }),
          property('body', { type: PropertyType.JSON, expression: false }),
          property('chatIds', { type: PropertyType.STRING_LIST }),
          property('odd-name', { type: PropertyType.BOOLEAN, expression: false }),
        ],
      }),
    ])

    expect(source).toContain('export interface TestNodeV1Params {')
    expect(source).toContain('  /** Path: Public */\n  path: string')
    expect(source).toContain('  count?: number | Expression')
    expect(source).toContain(`  method?: 'GET' | 'it\\'s'`)
    expect(source).toContain(`  events?: Array<'A'>`)
    expect(source).toContain('  rules?: Array<{\n    /** Value */\n    value: string\n  }>')
    expect(source).toContain('  body?: unknown')
    expect(source).toContain('  chatIds?: string[] | Expression')
    expect(source).toContain(`  'odd-name'?: boolean`)
    expect(source).toContain(`  'test.node@1': TestNodeV1Params`)
    expect(source).not.toContain('LegacyNode')
  })

  it('makes a required field optional when it is shown only under conditions, e.g. for some operations', () => {
    const source = generateNodeTypes([
      nodeType({
        properties: [
          property('operation', { type: PropertyType.OPTIONS, required: true, expression: false, options: [option('SEND'), option('GET_ME')] }),
          property('chat', { required: true, show: [{ field: 'operation', values: ['SEND'] }] }),
        ],
      }),
    ])

    expect(source).toContain(`  operation: 'SEND' | 'GET_ME'`)
    expect(source).toContain('  chat?: string')
  })
})

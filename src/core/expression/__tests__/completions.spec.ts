import { describe, expect, it } from 'vitest'
import { ExpressionCompletions } from '../completions'
import { asTemplate, itemPath, nodePath } from '../paths'

const completions = new ExpressionCompletions({
  json: { message: { text: 'hi', 'chat id': 5 }, tags: ['a'] },
  nodes: new Map<string, unknown>([
    ['Trigger', { chatId: 'c-1' }],
    ['Get user', { name: 'Ann' }],
  ]),
})

const labels = (before: string) => completions.complete(before).items.map((c) => c.label)

describe('ExpressionCompletions', () => {
  it('suggests variables at the start of a token', () => {
    expect(labels(' $')).toContain('$json')
    expect(labels(' $no')).toEqual(['$node', '$now'])
    expect(completions.complete(' $js').replaceLength).toBe(3)
  })

  it('walks member chains through the sample item', () => {
    expect(labels(' $json.')).toEqual(['message', 'tags'])
    expect(labels(' $json.message.t')).toEqual(['text'])
    expect(completions.complete(' $json.message.').items.find((c) => c.label === 'chat id')?.insert).toBe("['chat id']")
    expect(labels(' $json.tags.')).toEqual(['[0]'])
    expect(labels(" $json['message'].")).toEqual(['text', 'chat id'])
    expect(labels(' $input.first().json.')).toEqual(['message', 'tags'])
  })

  it('suggests node names and their output fields', () => {
    expect(labels(' $node.')).toEqual(['Trigger', 'Get user'])
    expect(completions.complete(' $node.').items[1]!.insert).toBe("['Get user']")
    expect(labels(" $node['G")).toEqual(['Get user'])
    expect(completions.complete(" $node['G").items[0]!.insert).toBe("Get user']")
    expect(labels(" $node['Get user'].")).toEqual(['json', 'output(0)'])
    expect(labels(" $node['Get user'].json.")).toEqual(['name'])
    expect(labels(' $node.Trigger.json.')).toEqual(['chatId'])
  })

  it('stays quiet where nothing fits', () => {
    expect(labels(' 12')).toEqual([])
    expect(labels(' $json.missing.')).toEqual([])
  })
})

describe('paths', () => {
  it('builds accessors for dragged fields', () => {
    expect(asTemplate(itemPath(['message', 'chat id', 0]))).toBe("{{ $json.message['chat id'][0] }}")
    expect(nodePath("Bob's node", ['a'])).toBe("$node['Bob\\'s node'].json.a")
  })
})

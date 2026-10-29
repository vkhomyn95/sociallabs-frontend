import { describe, expect, it } from 'vitest'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import { addableChildren, isRemovable, shownChildren } from '../collectionOptions'

const CHILDREN = [property('model', { required: true }), property('temperature'), property('topK'), property('timeout')]
const names = (list: { name: string }[]) => list.map((p) => p.name)

describe('collection options', () => {
  it('shows required children, children with a value and children just added, in order', () => {
    const shown = shownChildren(CHILDREN, { timeout: 30 }, new Set(['temperature']))
    expect(names(shown)).toEqual(['model', 'temperature', 'timeout'])
    expect(names(addableChildren(CHILDREN, shown))).toEqual(['topK'])
  })

  it('lets only optional children be removed', () => {
    expect(isRemovable(CHILDREN[0]!)).toBe(false)
    expect(isRemovable(CHILDREN[1]!)).toBe(true)
  })
})

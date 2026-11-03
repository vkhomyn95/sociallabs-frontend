import { describe, expect, it } from 'vitest'
import { PropertyType } from '@/core/node-types/descriptor'
import { property } from '@/core/node-types/__tests__/descriptorFixtures'
import LoadedListField from '../fields/LoadedListField.vue'
import LoadedOptionsField from '../fields/LoadedOptionsField.vue'
import StringField from '../fields/StringField.vue'
import { resolveField } from '../fieldRegistry'

describe('resolveField', () => {
  it('picks Viber bot subscribers from the list the server loads: one user, or several for a broadcast', () => {
    const receiver = property('receiver', { loadOptions: true })
    const receivers = property('receivers', { type: PropertyType.STRING_LIST, loadOptions: true })
    expect(resolveField('viber.botAction@1', receiver)).toBe(LoadedOptionsField)
    expect(resolveField('viber.botAction@1', receivers)).toBe(LoadedListField)
    expect(resolveField('viber.botAction@1', property('text'))).toBe(StringField)
  })
})

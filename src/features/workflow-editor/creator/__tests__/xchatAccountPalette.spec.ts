import { describe, expect, it } from 'vitest'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { Service, serviceOf } from '../services'
import { AppVariant, variantOf } from '../variants'

function xchatNode(name: string, credential: string): NodeTypeDescriptor {
  return { name, credentials: { types: [credential], required: true } } as unknown as NodeTypeDescriptor
}

describe('XChat in the node creator', () => {
  it('puts the account trigger and action next to the bot under XChat, as the Account variant', () => {
    for (const name of ['xchat.accountTrigger', 'xchat.accountAction']) {
      const node = xchatNode(name, 'XCHAT_ACCOUNT')
      expect(serviceOf(node.name)).toBe(Service.XCHAT)
      expect(variantOf(node)).toBe(AppVariant.ACCOUNT)
    }
    expect(variantOf(xchatNode('xchat.botAction', 'XCHAT_BOT'))).toBe(AppVariant.BOT)
  })
})

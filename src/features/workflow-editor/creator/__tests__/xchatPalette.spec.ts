import { describe, expect, it } from 'vitest'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { SERVICE_LABELS, Service, serviceOf } from '../services'
import { AppVariant, variantOf } from '../variants'

function xchatNode(name: string): NodeTypeDescriptor {
  return { name, credentials: { types: ['XCHAT_BOT'], required: true } } as unknown as NodeTypeDescriptor
}

describe('XChat in the node creator', () => {
  it('groups the XChat bot trigger and action under the XChat app as a bot', () => {
    for (const node of [xchatNode('xchat.botTrigger'), xchatNode('xchat.botAction')]) {
      expect(serviceOf(node.name)).toBe(Service.XCHAT)
      expect(variantOf(node)).toBe(AppVariant.BOT)
    }
    expect(SERVICE_LABELS[Service.XCHAT]).toBe('XChat')
  })
})

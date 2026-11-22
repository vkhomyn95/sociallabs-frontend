import { describe, expect, it } from 'vitest'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import { SERVICE_LABELS, Service, serviceOf } from '../services'
import { AppVariant, variantOf } from '../variants'

function tiktokNode(name: string, type = 'TIKTOK_ACCOUNT'): NodeTypeDescriptor {
  return { name, credentials: { types: [type], required: true } } as unknown as NodeTypeDescriptor
}

describe('TikTok in the node creator', () => {
  it('groups the TikTok account trigger and action under the TikTok app as an account', () => {
    for (const node of [tiktokNode('tiktok.accountTrigger'), tiktokNode('tiktok.accountAction')]) {
      expect(serviceOf(node.name)).toBe(Service.TIKTOK)
      expect(variantOf(node)).toBe(AppVariant.ACCOUNT)
    }
    expect(SERVICE_LABELS[Service.TIKTOK]).toBe('TikTok')
  })

  it('groups the TikTok bot trigger and action under the TikTok app as a bot', () => {
    for (const node of [tiktokNode('tiktok.botTrigger', 'TIKTOK_BOT'), tiktokNode('tiktok.botAction', 'TIKTOK_BOT')]) {
      expect(serviceOf(node.name)).toBe(Service.TIKTOK)
      expect(variantOf(node)).toBe(AppVariant.BOT)
    }
  })
})

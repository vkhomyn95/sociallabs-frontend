import { describe, expect, it } from 'vitest'
import {
  CredentialKind,
  CredentialPlatform,
  CredentialStatus,
  CredentialType,
} from '@/stores/credential/types'
import type { Credential } from '@/stores/credential/types'
import { credentialHints, formatPhone, platformUi, toApiError } from '../credential-ui'

function credential(metadata: Record<string, string>, name = 'My bot'): Credential {
  return {
    id: 1,
    name,
    type: CredentialType.TELEGRAM_BOT,
    kind: CredentialKind.BOT,
    platform: CredentialPlatform.TELEGRAM,
    status: CredentialStatus.ACTIVE,
    metadata,
    usageCount: 0,
    createdAt: '2026-10-25T10:00:00Z',
  }
}

describe('formatPhone', () => {
  it('adds the leading plus that TDLib omits', () => {
    expect(formatPhone('380981234567')).toBe('+380981234567')
  })

  it('strips formatting characters', () => {
    expect(formatPhone('+38 (098) 123-45-67')).toBe('+380981234567')
  })

  it('keeps a value without digits as is', () => {
    expect(formatPhone('hidden')).toBe('hidden')
  })
})

describe('credentialHints', () => {
  it('returns hints in priority order and respects the limit', () => {
    const hints = credentialHints(credential({ token: '1234…abcd', username: 'my_bot', phoneNumber: '380981234567' }), 2)
    expect(hints).toEqual(['@my_bot', '+380981234567'])
  })

  it('skips excluded keys and values equal to the name', () => {
    const hints = credentialHints(credential({ username: 'my_bot', token: '1234…abcd' }, '@my_bot'), 2, ['token'])
    expect(hints).toEqual([])
  })
})

describe('toApiError', () => {
  it('reads the backend error message and field details', () => {
    const error = { response: { data: { message: 'Invalid credential data', details: { botToken: 'Invalid format' } } } }
    expect(toApiError(error)).toEqual({ message: 'Invalid credential data', fields: { botToken: 'Invalid format' } })
  })

  it('falls back to the Error message, then to the fallback text', () => {
    expect(toApiError(new Error('Network Error')).message).toBe('Network Error')
    expect(toApiError(42, 'Failed').message).toBe('Failed')
  })
})

describe('platformUi', () => {
  it('shows a known platform as configured and one the frontend does not know yet by its name', () => {
    expect(platformUi(CredentialPlatform.TIKTOK)).toMatchObject({ label: 'TikTok', icon: 'brand_tiktok' })
    expect(platformUi('LINE')).toEqual({ label: 'LINE', icon: 'action_key', tone: 'gray-600' })
  })
})

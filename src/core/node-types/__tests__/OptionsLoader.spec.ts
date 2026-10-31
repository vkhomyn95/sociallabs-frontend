import { describe, expect, it, vi } from 'vitest'
import { OptionsLoader, type OptionsQuery } from '../OptionsLoader'

const query = (credentialId: number | null): OptionsQuery => ({ typeKey: 'ai.model.openai@1', property: 'model', credentialId, parameters: {} })
const choice = (value: string) => ({ value, displayName: value, description: '', group: '' })

describe('OptionsLoader', () => {
  it('asks once per type, field and credential', async () => {
    const fetch = vi.fn((q: OptionsQuery) => Promise.resolve([choice(`m${q.credentialId}`)]))
    const loader = new OptionsLoader(fetch)

    const [first, again] = await Promise.all([loader.load(query(1)), loader.load(query(1))])
    const other = await loader.load(query(2))

    expect(first).toEqual([choice('m1')])
    expect(again).toBe(first)
    expect(other).toEqual([choice('m2')])
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it('asks again on refresh and after a failure', async () => {
    const fetch = vi.fn<(q: OptionsQuery) => Promise<ReturnType<typeof choice>[]>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue([choice('m')])
    const loader = new OptionsLoader(fetch)

    await expect(loader.load(query(1))).rejects.toThrow('down')
    await loader.load(query(1))
    await loader.load(query(1), true)

    expect(fetch).toHaveBeenCalledTimes(3)
  })
})

import api from '@/core/services/api'
import type { MetaBotStatusResponse } from './metaBot.types'

/** Loads a bot's delivery status; it asks Meta about the account and its subscription, so it may take seconds. */
export type MetaBotStatusLoader = (credentialId: number, signal?: AbortSignal) => Promise<MetaBotStatusResponse>

/** @returns the status loader of a platform, by the credential endpoint's segment, e.g. `instagram-bot` */
export function metaBotStatus(segment: string): MetaBotStatusLoader {
  return async (credentialId, signal) => {
    const { data } = await api.get<MetaBotStatusResponse>(`/credentials/${credentialId}/${segment}/status`, {
      timeout: 25_000,
      signal,
    })
    return data
  }
}

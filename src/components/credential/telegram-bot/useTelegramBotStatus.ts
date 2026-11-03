import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { toApiError } from '../credential-ui'
import { TelegramBotService } from './telegramBot.service'
import type { TelegramBotStatus } from './telegramBot.types'

export interface TelegramBotStatusState {
  readonly status: Ref<TelegramBotStatus | null>
  readonly loading: Ref<boolean>
  readonly error: Ref<string | null>
  refresh(): Promise<void>
}

/** Loads a bot's delivery status for the credential, again on `refresh()`; a newer request cancels the older one. */
export function useTelegramBotStatus(credentialId: () => number): TelegramBotStatusState {
  const status = ref<TelegramBotStatus | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let request: AbortController | null = null

  async function refresh(): Promise<void> {
    request?.abort()
    const current = new AbortController()
    request = current
    loading.value = true
    error.value = null
    try {
      status.value = await TelegramBotService.status(credentialId(), current.signal)
    } catch (e) {
      if (!current.signal.aborted) error.value = toApiError(e, 'Could not load the bot status').message
    } finally {
      if (request === current) loading.value = false
    }
  }

  watch(credentialId, () => void refresh(), { immediate: true })
  onBeforeUnmount(() => request?.abort())

  return { status, loading, error, refresh }
}

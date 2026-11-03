import { onBeforeUnmount, ref, watch, type Ref } from 'vue'
import { toApiError } from '../credential-ui'

export interface BotStatusState<S> {
  readonly status: Ref<S | null>
  readonly loading: Ref<boolean>
  readonly error: Ref<string | null>
  refresh(): Promise<void>
}

/**
 * Loads a bot's status for the credential, again on `refresh()`; a newer request cancels the older one.
 *
 * @param load    asks the server for the status of a credential
 * @param failure what the panel says when the request fails without a message of its own
 */
export function useBotStatus<S>(
  credentialId: () => number,
  load: (credentialId: number, signal: AbortSignal) => Promise<S>,
  failure: string,
): BotStatusState<S> {
  const status = ref<S | null>(null) as Ref<S | null>
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
      status.value = await load(credentialId(), current.signal)
    } catch (e) {
      if (!current.signal.aborted) error.value = toApiError(e, failure).message
    } finally {
      if (request === current) loading.value = false
    }
  }

  watch(credentialId, () => void refresh(), { immediate: true })
  onBeforeUnmount(() => request?.abort())

  return { status, loading, error, refresh }
}

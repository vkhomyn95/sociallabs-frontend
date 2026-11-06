import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { CredentialService, ConnectEventType } from '@/stores/credential'
import type { ConnectEvent, ConnectInput, Credential, CredentialTypeDescriptor, FormValues } from '@/stores/credential'
import { toApiError } from '../credential-ui'
import { PAIRING_CODE_INSTRUCTIONS, QR_INSTRUCTIONS } from './connect-instructions'
import { ConnectView } from './connect.types'
import type { ConnectState } from './connect.types'

/**
 * Drives one interactive account connection: starts the backend session, maps SSE events
 * to screens, forwards user input and cancels the session when the component goes away.
 *
 * @param descriptor account type being connected
 * @param onConnected called once the account is saved
 * @returns reactive state and actions
 */
export function useAccountConnect(descriptor: CredentialTypeDescriptor, onConnected: (credential: Credential) => void) {
  const state = shallowRef<ConnectState>({ view: ConnectView.PARAMS })
  const busy = shallowRef(false)

  let sessionId: string | null = null
  let unsubscribe: (() => void) | null = null

  const finished = computed(() => state.value.view === ConnectView.SUCCESS || state.value.view === ConnectView.ERROR)

  function handle(event: ConnectEvent): void {
    switch (event.type) {
      case ConnectEventType.STATUS:
        // Keep the QR / code / input screen while the backend reports background progress.
        if (state.value.view === ConnectView.WAITING || state.value.view === ConnectView.PARAMS) {
          state.value = { view: ConnectView.WAITING, message: event.message }
        }
        break
      case ConnectEventType.QR_CODE:
        state.value = {
          view: ConnectView.QR,
          value: event.payload.value,
          format: event.payload.format,
          instructions: QR_INSTRUCTIONS[descriptor.platform] ?? [],
        }
        break
      case ConnectEventType.PAIRING_CODE:
        state.value = {
          view: ConnectView.PAIRING_CODE,
          code: event.payload.code,
          message: event.message,
          instructions: PAIRING_CODE_INSTRUCTIONS[descriptor.platform] ?? [],
        }
        break
      case ConnectEventType.INPUT_REQUIRED:
        state.value = {
          view: ConnectView.INPUT,
          input: event.payload.input,
          message: event.message,
          hint: event.payload.hint || undefined,
          error: event.payload.error || undefined,
        }
        break
      case ConnectEventType.SUCCESS:
        sessionId = null
        state.value = { view: ConnectView.SUCCESS, credential: event.payload.credential }
        onConnected(event.payload.credential)
        break
      case ConnectEventType.ERROR:
        sessionId = null
        state.value = { view: ConnectView.ERROR, message: event.message || 'Connection failed' }
        break
    }
  }

  /**
   * Start the flow with the start parameters from the params form.
   *
   * @param name   requested credential name, empty for the default
   * @param params start parameters
   */
  async function start(name: string, params: FormValues): Promise<void> {
    busy.value = true
    try {
      sessionId = await CredentialService.startConnect({ type: descriptor.type, name: name || undefined, params })
      state.value = { view: ConnectView.WAITING, message: 'Starting…' }
      unsubscribe = CredentialService.subscribeConnect(sessionId, handle, () =>
        handle({ type: ConnectEventType.ERROR, message: 'Connection to the server was lost', payload: {} }),
      )
    } catch (e) {
      state.value = { view: ConnectView.ERROR, message: toApiError(e, 'Failed to start connection').message }
    } finally {
      busy.value = false
    }
  }

  /**
   * Send the confirmation code or 2FA password.
   *
   * @param input kind of value requested by the backend
   * @param value user input
   */
  async function submit(input: ConnectInput, value: string): Promise<void> {
    if (!sessionId) return
    busy.value = true
    // Before the request: the verdict may arrive over SSE before the HTTP response does.
    state.value = { view: ConnectView.WAITING, message: 'Checking…' }
    try {
      await CredentialService.submitConnectInput(sessionId, input, value)
    } catch (e) {
      state.value = { view: ConnectView.ERROR, message: toApiError(e, 'Failed to submit').message }
    } finally {
      busy.value = false
    }
  }

  /** Abort an unfinished session; a finished one is left alone so the account stays connected. */
  function cancel(): void {
    unsubscribe?.()
    unsubscribe = null
    if (sessionId) {
      void CredentialService.cancelConnect(sessionId).catch(() => undefined)
      sessionId = null
    }
  }

  /** Back to the params form after an error. */
  function retry(): void {
    cancel()
    state.value = { view: ConnectView.PARAMS }
  }

  onBeforeUnmount(cancel)

  return { state, busy, finished, start, submit, cancel, retry }
}

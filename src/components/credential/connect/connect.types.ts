import type { ConnectInput, ConnectPin, QrFormat } from '@/stores/credential/types'
import type { Credential } from '@/stores/credential/types'

/** Screens of the account connection flow. */
export enum ConnectView {
  PARAMS = 'params',
  WAITING = 'waiting',
  QR = 'qr',
  PAIRING_CODE = 'pairing-code',
  AUTHORIZE = 'authorize',
  INPUT = 'input',
  SUCCESS = 'success',
  ERROR = 'error',
}

/** Flow state; everything except `view` is passed to the step component as props. */
export type ConnectState =
  | { view: ConnectView.PARAMS }
  | { view: ConnectView.WAITING; message: string }
  | { view: ConnectView.QR; value: string; format: QrFormat; instructions: string[] }
  | { view: ConnectView.PAIRING_CODE; code: string; message: string; instructions: string[] }
  | { view: ConnectView.AUTHORIZE; url: string; message: string; note?: string }
  | {
      view: ConnectView.INPUT
      input: ConnectInput
      message: string
      hint?: string
      error?: string
      /** Set when the password is an XChat PIN. */
      pin?: ConnectPin
    }
  | { view: ConnectView.SUCCESS; credential: Credential }
  | { view: ConnectView.ERROR; message: string }

import { CredentialPlatform } from '@/stores/credential/types'

/** How to scan the QR code on each platform; platforms without QR sign-in are omitted. */
export const QR_INSTRUCTIONS: Partial<Record<CredentialPlatform, string[]>> = {
  [CredentialPlatform.TELEGRAM]: [
    'Open Telegram on your phone',
    'Go to Settings → Devices → Link Desktop Device',
    'Point your phone at this screen',
  ],
  [CredentialPlatform.VIBER]: [
    'Open Viber on your phone',
    'Go to More → QR code scanner',
    'Point your phone at this screen',
  ],
  [CredentialPlatform.WHATSAPP]: [
    'Open WhatsApp on your phone',
    'Go to Settings → Linked devices → Link a device',
    'Point your phone at this screen',
  ],
}

/** Where to enter a pairing code on each platform; platforms without code linking are omitted. */
export const PAIRING_CODE_INSTRUCTIONS: Partial<Record<CredentialPlatform, string[]>> = {
  [CredentialPlatform.WHATSAPP]: [
    'Open WhatsApp on your phone',
    'Go to Settings → Linked devices → Link a device',
    'Tap “Link with phone number instead” and enter the code',
  ],
}

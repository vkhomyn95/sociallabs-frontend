/** Messengers whose nodes the node creator groups as apps; the prefix of a node type name is its service. */
export enum Service {
  TELEGRAM = 'telegram',
  VIBER = 'viber',
  WHATSAPP = 'whatsapp',
  MESSENGER = 'messenger',
  INSTAGRAM = 'instagram',
  XCHAT = 'xchat',
  TIKTOK = 'tiktok',
}

export const SERVICE_LABELS: Readonly<Record<Service, string>> = {
  [Service.TELEGRAM]: 'Telegram',
  [Service.VIBER]: 'Viber',
  [Service.WHATSAPP]: 'WhatsApp',
  [Service.MESSENGER]: 'Messenger',
  [Service.INSTAGRAM]: 'Instagram',
  [Service.XCHAT]: 'XChat',
  [Service.TIKTOK]: 'TikTok',
}

const SERVICES: ReadonlySet<string> = new Set(Object.values(Service))

/** @returns the service of a node type, e.g. Telegram for `telegram.botAction`; null for core and AI nodes */
export function serviceOf(typeName: string): Service | null {
  const prefix = typeName.split('.')[0] ?? ''
  return SERVICES.has(prefix) ? (prefix as Service) : null
}

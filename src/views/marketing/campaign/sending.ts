/** Спільні для всіх кампаній налаштування надсилання (блок SendingSection). */
export interface SendingSettings {
  accounts: { name: string; on: boolean }[]
  perAccountDay: string
  delayMin: string
  delayMax: string
  hours: string
  stopOnFlood: boolean
}

export const defaultSending = (perAccountDay: string, delayMin = '90', delayMax = '300'): SendingSettings => ({
  accounts: [
    { name: '@vkhomyn', on: true },
    { name: '@growth_acc_2', on: true },
    { name: '@growth_acc_3', on: false },
  ],
  perAccountDay,
  delayMin,
  delayMax,
  hours: '09:00–22:00',
  stopOnFlood: true,
})

import { ToastType } from '@/stores/toast/types.ts'
import type { ToastStore } from '@/stores/toast/types.ts'

export const actions = {

  show(this: ToastStore, type: ToastType, message: string, duration = 3000): void {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`

    this.items.push({ id, type, message, duration })

    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration)
    }
  },

  success(this: ToastStore, message: string, duration?: number): void {
    this.show(ToastType.SUCCESS, message, duration)
  },

  error(this: ToastStore, message: string, duration?: number): void {
    this.show(ToastType.ERROR, message, duration)
  },

  warning(this: ToastStore, message: string, duration?: number): void {
    this.show(ToastType.WARNING, message, duration)
  },

  info(this: ToastStore, message: string, duration?: number): void {
    this.show(ToastType.INFO, message, duration)
  },

  dismiss(this: ToastStore, id: string): void {
    const idx = this.items.findIndex((t) => t.id === id)
    if (idx !== -1) this.items.splice(idx, 1)
  },
}

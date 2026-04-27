import type { Component } from 'vue'
import { markRaw } from 'vue'
import type { ModalInstance, ModalOptions, ModalState } from '@/stores/modal/types.ts'

export const actions = {
  open<T = unknown>(
    this: ModalState,
    component: Component,
    props: Record<string, unknown> = {},
    options: ModalOptions = {}
  ): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const instance: ModalInstance = {
        id: `modal-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        component: markRaw(component),
        props,
        options: {
          size: options.size ?? 'md',
          closable: options.closable ?? true,
          closeOnBackdrop: options.closeOnBackdrop ?? true,
        },
        resolve: resolve as (value: unknown) => void,
        reject,
      }

      this.stack.push(instance)
    })
  },

  close(this: ModalState, modalId: string, result?: unknown): void {
    const idx = this.stack.findIndex((m) => m.id === modalId)
    if (idx === -1) return

    const instance = this.stack[idx]
    this.stack.splice(idx, 1)
    instance.resolve(result)
  },

  dismiss(this: ModalState, modalId: string): void {
    const idx = this.stack.findIndex((m) => m.id === modalId)
    if (idx === -1) return

    const instance = this.stack[idx]
    this.stack.splice(idx, 1)
    instance.reject()
  },

  closeAll(this: ModalState): void {
    this.stack.forEach((m) => m.reject())
    this.stack = []
  }
}

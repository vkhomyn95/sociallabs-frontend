import type { Component } from 'vue'
import { useModalStore } from '@/stores/modal'
import type { ModalOptions } from '@/stores/modal/types.ts'


export function useModal() {
  const store = useModalStore()

  /**
   * Open a modal and get a promise that resolves with the result.
   *
   * @example
   * const result = await modal.open(ConfirmModal, { message: 'Are you sure?' })
   */
  const open = <T = unknown>(
    component: Component,
    props: Record<string, unknown> = {},
    options: ModalOptions = {}
  ): Promise<T> => {
    return store.open<T>(component, props, options)
  }

  /**
   * Open a simple confirmation dialog.
   * Resolves true on confirm, rejects on cancel.
   */
  const confirm = (
    message: string,
    options: { title?: string; confirmLabel?: string; danger?: boolean } = {}
  ): Promise<boolean> => {
    return store.open(
      // Lazy import to avoid circular deps — resolved at call time
      // ConfirmModal is a thin wrapper registered globally
      'ConfirmModal' as unknown as Component,
      { message, ...options },
      { size: 'sm', closeOnBackdrop: false }
    )
  }

  const closeAll = (): void => {
    store.closeAll()
  }

  return { open, confirm, closeAll }
}

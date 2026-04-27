import type { ModalInstance } from '@/stores/modal/types.ts'

export const getters = {
  hasModals: (state): boolean => state.stack.length > 0,
  topModal: (state): ModalInstance | null => state.stack.length > 0 ? state.stack[state.stack.length - 1] : null,
}

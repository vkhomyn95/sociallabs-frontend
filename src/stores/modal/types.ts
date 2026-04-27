import type { Component, Raw } from 'vue'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalOptions {
  size?: ModalSize
  closable?: boolean
  closeOnBackdrop?: boolean
}

export interface ModalInstance {
  id: string
  component: Raw<Component>
  props: Record<string, unknown>
  options: Required<ModalOptions>
  resolve: (value: unknown) => void
  reject: () => void
}

export interface ModalState {
  stack: ModalInstance[]
}

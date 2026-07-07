import type { Component, Raw } from 'vue'

export type ModalSize = ModalType.sm | ModalType.md | ModalType.lg | ModalType.xl | ModalType.max

export enum ModalType {
  sm = 'sm',
  md = 'md',
  lg = 'lg',
  xl = 'xl',
  max = 'max'
}

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

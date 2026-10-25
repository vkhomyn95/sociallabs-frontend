import type { CredentialState } from './types'

export const state = (): CredentialState => ({
  types: [],
  typesLoading: false,
  summary: null,
})

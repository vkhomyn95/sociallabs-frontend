import type { CredentialKind, CredentialState, CredentialType, CredentialTypeDescriptor } from './types'

export const getters = {
  /** Descriptor lookup by type. */
  typeDescriptor: (state: CredentialState) => (type: CredentialType): CredentialTypeDescriptor | undefined =>
    state.types.find((descriptor) => descriptor.type === type),

  /** Descriptors of one kind, in backend order. */
  typesOfKind: (state: CredentialState) => (kind: CredentialKind): CredentialTypeDescriptor[] =>
    state.types.filter((descriptor) => descriptor.kind === kind),

  /** Number of credentials of a kind, 0 until the summary is loaded. */
  countOfKind: (state: CredentialState) => (kind: CredentialKind): number =>
    state.summary?.counts[kind] ?? 0,
}

import type { CredentialState } from './types';

export const state: CredentialState = {
  credentials: [],
  selectedCredential: null,
  loading: false,
  error: null
};

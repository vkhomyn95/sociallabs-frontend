import type { CredentialState, Credential, CredentialType } from './types';

export const getters = {

  getCredentialById: (state: CredentialState) => (id: number): Credential | undefined => {
    return state.credentials.find(c => c.id === id);
  },

  getCredentialsByType: (state: CredentialState) => (type: CredentialType) => {
    return state.credentials.filter(c => c.type === type);
  },

  hasTelegramCredentials: (state: CredentialState): boolean => {
    return state.credentials.some(c => c.type === 'TELEGRAM_CLIENT');
  },

  credentialCount: (state: CredentialState): number => {
    return state.credentials.length;
  }
};

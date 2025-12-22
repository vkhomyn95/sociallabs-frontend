import type { AuthState } from './types';

const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export const state: AuthState = {
  user: null,
  token: localStorage.getItem(TOKEN_KEY),
  refreshToken: localStorage.getItem(REFRESH_TOKEN_KEY),
  loading: false,
  error: null,
  isInitialized: false
};

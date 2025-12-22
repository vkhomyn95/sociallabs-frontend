export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
  createdAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

// Валідаційні помилки
export interface ValidationErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

export interface CredentialState {
  credentials: Credential[];
  selectedCredential: Credential | null;
  loading: boolean;
  error: string | null;
}

export interface Credential {
  id: number;
  name: string;
  type: CredentialType;
  description?: string;
  createdAt: string;
}

export type CredentialType =
  | 'TELEGRAM_CLIENT'
  | 'TELEGRAM_BOT'
  | 'HTTP_AUTH'
  | 'API_KEY'
  | 'OAUTH2'
  | 'DATABASE'
  | 'SMTP'
  | 'FTP'
  | 'SSH'
  | 'AWS'
  | 'GOOGLE_CLOUD'
  | 'AZURE';

export interface CredentialRequest {
  name: string;
  type: string;
  description?: string;
  data: Record<string, any>;
}

export interface TelegramAuthUpdate {
  type: 'status' | 'qr_code' | 'code_required' | 'password_required' | 'success' | 'error';
  message?: string;
  link?: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
    username: string;
  };
  credentialId?: number;
  timestamp: number;
}

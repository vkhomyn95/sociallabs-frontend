export interface APIResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
  error?: string;
}

export interface LoadConfig {
  page?: number;
  size?: number;
  sort?: string;
  filter?: Record<string, any>;
}

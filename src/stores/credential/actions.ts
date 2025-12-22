import type { APIResponse } from '@/core/models/Api';
import type { Credential, CredentialState, CredentialRequest } from './types';
import { CredentialService } from './service';

export const actions = {

  async FETCH_CREDENTIALS(this: CredentialState): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Credential[]> = await CredentialService.loadAll();
      if (res.success) {
        this.credentials = res.data;
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to fetch credentials:', error);
    } finally {
      this.loading = false;
    }
  },

  async FETCH_CREDENTIALS_BY_TYPE(this: CredentialState, type: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Credential[]> = await CredentialService.loadByType(type);
      if (res.success) {
        this.credentials = res.data;
      }
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to fetch credentials by type:', error);
    } finally {
      this.loading = false;
    }
  },

  async CREATE_CREDENTIAL(this: CredentialState, data: CredentialRequest): Promise<Credential | null> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Credential> = await CredentialService.create(data);
      if (res.success) {
        this.credentials.push(res.data);
        return res.data;
      }
      return null;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to create credential:', error);
      return null;
    } finally {
      this.loading = false;
    }
  },

  async UPDATE_CREDENTIAL(
    this: CredentialState,
    id: number,
    data: CredentialRequest
  ): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<Credential> = await CredentialService.update(id, data);
      if (res.success) {
        const index = this.credentials.findIndex(c => c.id === id);
        if (index !== -1) {
          this.credentials[index] = res.data;
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to update credential:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  async DELETE_CREDENTIAL(this: CredentialState, id: number): Promise<boolean> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<void> = await CredentialService.delete(id);
      if (res.success) {
        this.credentials = this.credentials.filter(c => c.id !== id);
        if (this.selectedCredential?.id === id) {
          this.selectedCredential = null;
        }
        return true;
      }
      return false;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to delete credential:', error);
      return false;
    } finally {
      this.loading = false;
    }
  },

  async TEST_CREDENTIAL(this: CredentialState, id: number): Promise<any> {
    this.loading = true;
    this.error = null;

    try {
      const res: APIResponse<any> = await CredentialService.test(id);
      return res.data;
    } catch (error: any) {
      this.error = error.message;
      console.error('Failed to test credential:', error);
      return null;
    } finally {
      this.loading = false;
    }
  },

  SELECT_CREDENTIAL(this: CredentialState, credential: Credential | null): void {
    this.selectedCredential = credential;
  },

  CLEAR_ERROR(this: CredentialState): void {
    this.error = null;
  }
};

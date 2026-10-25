import { CredentialService } from './service'
import type { CredentialState } from './types'

export const actions = {
  /**
   * Load type descriptors once; later calls are no-ops unless forced.
   *
   * @param force reload even when already loaded
   */
  async LOAD_TYPES(this: CredentialState, force = false): Promise<void> {
    if ((this.types.length && !force) || this.typesLoading) return
    this.typesLoading = true
    try {
      this.types = await CredentialService.types()
    } finally {
      this.typesLoading = false
    }
  },

  /** Refresh per-kind counters (after create/delete). */
  async LOAD_SUMMARY(this: CredentialState): Promise<void> {
    this.summary = await CredentialService.summary()
  },
}

import type { Component } from 'vue'
import { defineAsyncComponent } from 'vue'
import { CredentialType } from '@/stores/credential/types'

/**
 * Setup guides shown above a connect form, for types whose provider needs steps before the form can be filled (a
 * developer app that must list our redirect URL first). Types without one are omitted.
 */
export const CONNECT_GUIDES: Partial<Record<CredentialType, Component>> = {
  [CredentialType.TIKTOK_BOT]: defineAsyncComponent(() => import('../tiktok-bot/TikTokBotSetupGuide.vue')),
}

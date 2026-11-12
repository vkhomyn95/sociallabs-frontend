<script setup lang="ts">
import type { Credential } from '@/stores/credential/types'
import MetaBotPanel from '../meta-bot/MetaBotPanel.vue'
import { INSTAGRAM_BOT_UI } from './instagramBot.ui'

/** A professional Instagram account's delivery status, token, webhook setup and users. */
defineProps<{ credential: Credential }>()
</script>

<template>
  <MetaBotPanel :credential="credential" :platform="INSTAGRAM_BOT_UI" />
</template>

<script setup lang="ts">
import type { Credential } from '@/stores/credential/types'
import MetaBotPanel from '../meta-bot/MetaBotPanel.vue'
import { MESSENGER_BOT_UI } from './messengerBot.ui'

/** A Facebook page's Messenger delivery status, webhook setup and people who wrote. */
defineProps<{ credential: Credential }>()
</script>

<template>
  <MetaBotPanel :credential="credential" :platform="MESSENGER_BOT_UI" />
</template>

<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { TelegramBotTriggerParams } from '../index'

const props = defineProps<{ params: TelegramBotTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<TelegramBotTriggerParams>] }>()

function set<K extends keyof TelegramBotTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-tg-section">

    <div class="slb-tg-info">
      <i class="fas fa-info-circle"></i>
      Choose which media types to automatically download when received. Files will be available as binary data in the workflow.
    </div>

    <div class="slb-tg-group-label">Auto-Download</div>

    <div class="slb-tg-options">
      <SlbCheckbox
        :model-value="params.downloadImages"
        label="Images"
        description="Automatically download received photos"
        @update:model-value="set('downloadImages', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadDocuments"
        label="Documents"
        description="Automatically download received documents and files"
        @update:model-value="set('downloadDocuments', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadAudio"
        label="Audio"
        description="Automatically download received audio files"
        @update:model-value="set('downloadAudio', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVideo"
        label="Video"
        description="Automatically download received videos"
        @update:model-value="set('downloadVideo', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVideoNotes"
        label="Video Notes"
        description="Automatically download received video notes (round videos)"
        @update:model-value="set('downloadVideoNotes', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVoice"
        label="Voice Messages"
        description="Automatically download received voice messages"
        @update:model-value="set('downloadVoice', $event)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

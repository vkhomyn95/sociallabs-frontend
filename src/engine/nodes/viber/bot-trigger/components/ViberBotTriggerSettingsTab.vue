<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { ViberBotTriggerParams } from '../index'

const props = defineProps<{ params: ViberBotTriggerParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberBotTriggerParams>] }>()

function set<K extends keyof ViberBotTriggerParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-vb-section">

    <!-- User data -->
    <div class="slb-vb-group-label">User Data in Callbacks</div>

    <div class="slb-vb-info">
      <i class="fas fa-info-circle"></i>
      By default Viber sends placeholder values for user names and photos.
      Enable these to receive real data (requires user's Content Personalisation setting).
    </div>

    <div class="slb-vb-options">
      <SlbCheckbox
        :model-value="params.sendName"
        label="Send Name"
        description="Receive the user's real display name in callbacks"
        @update:model-value="set('sendName', $event)"
      />
      <SlbCheckbox
        :model-value="params.sendPhoto"
        label="Send Photo"
        description="Receive the user's avatar URL in callbacks"
        @update:model-value="set('sendPhoto', $event)"
      />
    </div>

    <hr class="slb-vb-divider" />

    <!-- Downloads -->
    <div class="slb-vb-group-label">Auto-Download Media</div>

    <div class="slb-vb-options">
      <SlbCheckbox
        :model-value="params.downloadImages"
        label="Images"
        description="Download picture messages and make them available as binary data"
        @update:model-value="set('downloadImages', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVideos"
        label="Videos"
        description="Download video messages and make them available as binary data"
        @update:model-value="set('downloadVideos', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadFiles"
        label="Files"
        description="Download file messages and make them available as binary data"
        @update:model-value="set('downloadFiles', $event)"
      />
      <SlbCheckbox
        :model-value="params.downloadVoice"
        label="Voice"
        description="Download voice messages and make them available as binary data"
        @update:model-value="set('downloadVoice', $event)"
      />
    </div>

    <hr class="slb-vb-divider" />

    <!-- Advanced -->
    <div class="slb-vb-group-label">Advanced</div>

    <div class="slb-vb-options">
      <SlbCheckbox
        :model-value="params.continueOnFail"
        label="Continue on Fail"
        description="Continue workflow execution even if this node fails"
        @update:model-value="set('continueOnFail', $event)"
      />
    </div>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

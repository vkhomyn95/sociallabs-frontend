<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { ViberClientActionParams } from '../index'

const props = defineProps<{ params: ViberClientActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberClientActionParams>] }>()

function set<K extends keyof ViberClientActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-vb-section">

    <div class="slb-vb-info">
      <i class="fas fa-info-circle"></i>
      A keyboard can be attached to any message. It replaces the device's native keyboard
      and supports <strong>reply</strong> and <strong>open-url</strong> button types.
    </div>

    <SlbCheckbox
      :model-value="params.attachKeyboard"
      label="Attach Keyboard"
      description="Send a custom keyboard with this message"
      @update:model-value="set('attachKeyboard', $event)"
    />

    <template v-if="params.attachKeyboard">
      <div class="slb-vb-field">
        <label class="slb-vb-label">Keyboard JSON</label>
        <textarea
          :value="params.keyboardJson"
          class="slb-vb-textarea slb-vb-textarea--code"
          rows="12"
          @input="set('keyboardJson', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { ViberBotActionParams } from '../index'

const props = defineProps<{ params: ViberBotActionParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<ViberBotActionParams>] }>()

function set<K extends keyof ViberBotActionParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="slb-vb-section">

    <div class="slb-vb-info">
      <i class="fas fa-info-circle"></i>
      A custom keyboard can be attached to any message type. The keyboard appears instead of the device's native keyboard and supports <strong>reply</strong> and <strong>open-url</strong> action types.
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

      <div class="slb-vb-warn">
        <i class="fas fa-exclamation-triangle"></i>
        The client always shows the <strong>last keyboard</strong> sent. When sending multiple messages,
        only include the keyboard in the last one.
      </div>
    </template>

  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

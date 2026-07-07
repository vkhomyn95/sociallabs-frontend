<script setup lang="ts">
import { SlbCheckbox } from '@/components/ui'
import type { HttpRequestParams } from '../index'

const props = defineProps<{ params: HttpRequestParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<HttpRequestParams>] }>()

function set<K extends keyof HttpRequestParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="http-section">
    <SlbCheckbox
      :model-value="params.sendHeaders"
      label="Send Custom Headers"
      @update:model-value="set('sendHeaders', $event)"
    />

    <div v-if="params.sendHeaders" class="http-indent">
      <label class="http-label">Headers (JSON)</label>
      <textarea
        :value="params.headersJson"
        class="http-code"
        rows="7"
        placeholder='{"Accept": "application/json", "X-Custom": "value"}'
        @input="set('headersJson', ($event.target as HTMLTextAreaElement).value)"
      />
    </div>

    <div v-if="!params.sendHeaders" class="http-empty">
      <i class="fas fa-list"></i>
      Enable above to add custom headers
    </div>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
@use '@/components/ui/variables' as *;

.http-empty {
  display: flex;
  align-items: center;
  gap: $slb-ui-space-4;
  padding: $slb-ui-space-6 $slb-ui-space-8;
  border-radius: $slb-ui-radius-md;
  background: $slb-ui-gray-50;
  color: $slb-ui-gray-400;
  font-size: $slb-ui-font-sm;
  i { color: $slb-ui-gray-300; }
}
</style>

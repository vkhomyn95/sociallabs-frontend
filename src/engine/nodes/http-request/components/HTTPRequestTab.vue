<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect, SlbCheckbox } from '@/components/ui'
import { type HttpRequestParams, METHOD_OPTIONS, AuthType } from '../index'

const props = defineProps<{ params: HttpRequestParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<HttpRequestParams>] }>()

function set<K extends keyof HttpRequestParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const showBasic  = computed(() => props.params.authType === AuthType.BASIC)
const showBearer = computed(() => props.params.authType === AuthType.BEARER)
const showHeader = computed(() => props.params.authType === AuthType.HEADER)
const showQuery  = computed(() => props.params.authType === AuthType.QUERY)
</script>

<template>
  <div class="http-section">
    <div style="display:grid;grid-template-columns:140px 1fr;gap:10px">
      <SlbSelect
        :model-value="params.method"
        :options="METHOD_OPTIONS"
        label="Method"
        @update:model-value="set('method', $event)"
      />
      <SlbInput
        :model-value="params.url"
        label="URL"
        placeholder="https://api.example.com/endpoint"
        hint="Supports expressions: {{$json.url}}"
        @update:model-value="set('url', String($event))"
      />
    </div>

    <div>
      <SlbCheckbox
        :model-value="params.sendQueryParams"
        label="Send Query Parameters"
        @update:model-value="set('sendQueryParams', $event)"
      />
      <div v-if="params.sendQueryParams" class="http-indent" style="margin-top:8px">
        <label class="http-label">Query Parameters (JSON)</label>
        <textarea
          :value="params.queryParamsJson"
          class="http-code"
          rows="4"
          placeholder='{"page": 1, "limit": 20}'
          @input="set('queryParamsJson', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

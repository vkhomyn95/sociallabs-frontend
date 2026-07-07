<script setup lang="ts">
import { SlbSelect, SlbCheckbox, SlbInput } from '@/components/ui'
import { type HttpRequestParams, RESPONSE_FORMAT_OPTIONS } from '../index'

const props = defineProps<{ params: HttpRequestParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<HttpRequestParams>] }>()

function set<K extends keyof HttpRequestParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}
</script>

<template>
  <div class="http-section">
    <SlbSelect
      :model-value="params.responseFormat"
      :options="RESPONSE_FORMAT_OPTIONS"
      label="Response Format"
      @update:model-value="set('responseFormat', $event)"
    />

    <SlbInput
      :model-value="String(params.timeout)"
      label="Timeout (ms)"
      type="number"
      hint="Request timeout in milliseconds"
      @update:model-value="set('timeout', Number($event))"
    />

    <div class="http-checks">
      <SlbCheckbox :model-value="params.includeResponseMetadata" label="Include Response Headers & Status"     @update:model-value="set('includeResponseMetadata', $event)" />
      <SlbCheckbox :model-value="params.followRedirects"         label="Follow Redirects"                      @update:model-value="set('followRedirects', $event)"         />
      <SlbCheckbox :model-value="params.neverError"              label="Never Error (return success on 4xx/5xx)" @update:model-value="set('neverError', $event)"            />
      <SlbCheckbox :model-value="params.ignoreSslIssues"         label="Ignore SSL Issues"                      @update:model-value="set('ignoreSslIssues', $event)"        />
      <SlbCheckbox :model-value="params.continueOnFail"          label="Continue on Fail"                       @update:model-value="set('continueOnFail', $event)"         />
    </div>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

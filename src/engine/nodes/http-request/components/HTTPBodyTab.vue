<script setup lang="ts">
import { computed } from 'vue'
import { SlbCheckbox, SlbSelect, SlbInput } from '@/components/ui'
import { type HttpRequestParams, BODY_TYPE_OPTIONS, BodyContentType } from '../index'

const props = defineProps<{ params: HttpRequestParams }>()
const emit  = defineEmits<{ 'update:params': [Partial<HttpRequestParams>] }>()

function set<K extends keyof HttpRequestParams>(key: K, val: any) {
  emit('update:params', { [key]: val })
}

const showJsonBody = computed(
  () => props.params.sendBody &&
    (props.params.bodyContentType === BodyContentType.JSON ||
      props.params.bodyContentType === BodyContentType.FORM_URL_ENCODED ||
      props.params.bodyContentType === BodyContentType.FORM_DATA)
)
const showRaw = computed(
  () => props.params.sendBody && props.params.bodyContentType === BodyContentType.RAW
)
</script>

<template>
  <div class="http-section">
    <SlbCheckbox
      :model-value="params.sendBody"
      label="Send Body"
      @update:model-value="set('sendBody', $event)"
    />

    <template v-if="params.sendBody">
      <SlbSelect
        :model-value="params.bodyContentType"
        :options="BODY_TYPE_OPTIONS"
        label="Body Content Type"
        @update:model-value="set('bodyContentType', $event)"
      />

      <div v-if="showJsonBody" class="http-indent">
        <label class="http-label">Body (JSON)</label>
        <textarea
          :value="params.bodyJson"
          class="http-code"
          rows="8"
          placeholder='{"key": "value"}'
          @input="set('bodyJson', ($event.target as HTMLTextAreaElement).value)"
        />
      </div>

      <template v-if="showRaw">
        <SlbInput
          :model-value="params.rawContentType"
          label="Content Type"
          placeholder="text/xml"
          @update:model-value="set('rawContentType', String($event))"
        />
        <div>
          <label class="http-label">Raw Body</label>
          <textarea
            :value="params.rawBody"
            class="http-code"
            rows="6"
            @input="set('rawBody', ($event.target as HTMLTextAreaElement).value)"
          />
        </div>
      </template>
    </template>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { SlbInput, SlbSelect } from '@/components/ui'
import { type HttpRequestParams, AUTH_OPTIONS, AuthType } from '../index'

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
    <SlbSelect
      :model-value="params.authType"
      :options="AUTH_OPTIONS"
      label="Authentication"
      @update:model-value="set('authType', $event)"
    />

    <template v-if="showBasic">
      <SlbInput :model-value="params.basicUsername" label="Username" placeholder="user@example.com" @update:model-value="set('basicUsername', String($event))" />
      <SlbInput :model-value="params.basicPassword" label="Password" type="password" placeholder="••••••••" @update:model-value="set('basicPassword', String($event))" />
    </template>

    <SlbInput
      v-if="showBearer"
      :model-value="params.bearerToken"
      label="Bearer Token"
      type="password"
      placeholder="eyJhbGci..."
      @update:model-value="set('bearerToken', String($event))"
    />

    <template v-if="showHeader">
      <SlbInput :model-value="params.headerAuthName"  label="Header Name"  placeholder="X-Api-Key"     @update:model-value="set('headerAuthName',  String($event))" />
      <SlbInput :model-value="params.headerAuthValue" label="Header Value" type="password" placeholder="your-api-key" @update:model-value="set('headerAuthValue', String($event))" />
    </template>

    <template v-if="showQuery">
      <SlbInput :model-value="params.queryAuthName"  label="Query Param Name"  placeholder="api_key" @update:model-value="set('queryAuthName',  String($event))" />
      <SlbInput :model-value="params.queryAuthValue" label="Query Param Value"                        @update:model-value="set('queryAuthValue', String($event))" />
    </template>

    <div v-if="params.authType === 'NONE'" class="http-auth-empty">
      <i class="fas fa-lock-open"></i>
      No authentication selected
    </div>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
@use '@/components/ui/variables' as *;

.http-auth-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: $slb-ui-radius-md;
  background: $slb-ui-gray-50;
  color: $slb-ui-gray-400;
  font-size: 12px;
  i { color: $slb-ui-gray-300; }
}
</style>

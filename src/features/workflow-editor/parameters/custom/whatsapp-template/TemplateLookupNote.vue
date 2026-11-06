<script setup lang="ts">
import { computed } from 'vue'
import { SlbButton } from '@sociallabs/frontend-components'
import { LOOKUP_HINTS, TemplateLookup } from './templateValues'

/** Why a template's fields cannot follow it yet, with a retry when asking again may help. */
const props = defineProps<{
  lookup: Exclude<TemplateLookup, TemplateLookup.READY>
  error: string | null
  languages: readonly string[]
}>()
const emit = defineEmits<{ reload: [] }>()

/** Lookups that a template made or approved meanwhile, or a passing Meta failure, may change. */
const RETRIED: ReadonlySet<TemplateLookup> = new Set([
  TemplateLookup.FAILED,
  TemplateLookup.NOT_FOUND,
  TemplateLookup.NO_LANGUAGE,
])

const detail = computed(() => {
  if (props.lookup === TemplateLookup.FAILED) return props.error
  if (props.lookup === TemplateLookup.NO_LANGUAGE) return `Its languages: ${props.languages.join(', ')}`
  return null
})
</script>

<template>
  <div class="wa-template-note" data-test="template-note">
    <span>{{ LOOKUP_HINTS[lookup] }}<template v-if="detail">: {{ detail }}</template></span>
    <SlbButton v-if="RETRIED.has(lookup)" size="sm" variant="ghost" @click="emit('reload')">Reload</SlbButton>
  </div>
</template>

<style scoped lang="scss">
.wa-template-note {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
}
</style>

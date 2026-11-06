<script setup lang="ts">
import { computed } from 'vue'
import { textParts } from './templateValues'

/** A template's text with its variables marked. */
const props = defineProps<{ text: string }>()
const parts = computed(() => textParts(props.text))
</script>

<template>
  <p class="wa-template-text">
    <template v-for="(part, index) in parts" :key="index">
      <mark v-if="part.variable" class="wa-template-text__variable">{{ part.text }}</mark>
      <template v-else>{{ part.text }}</template>
    </template>
  </p>
</template>

<style scoped lang="scss">
.wa-template-text {
  margin: 0;
  padding: 8px 10px;
  font-size: var(--slb-font-sm);
  line-height: 1.45;
  color: var(--slb-color-text);
  white-space: pre-wrap;
  background: var(--slb-color-surface);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-sm);
}

.wa-template-text__variable {
  padding: 0 2px;
  color: var(--slb-color-primary);
  background: none;
  font-weight: var(--slb-fw-medium);
}
</style>

<script setup lang="ts">
import { SlbIcon } from '@sociallabs/frontend-components'

/** The dashed "add a button" tile under a Viber preview. */
defineProps<{ empty: boolean }>()
const emit = defineEmits<{ add: [] }>()
</script>

<template>
  <button type="button" class="wf-viber-add" @click="emit('add')">
    <SlbIcon name="action_plus" :size="12" />
    {{ empty ? 'Add a button' : 'Add button' }}
  </button>
</template>

<style scoped lang="scss">
.wf-viber-add {
  display: inline-flex;
  gap: 4px;
  align-items: center;
  justify-content: center;
  height: 30px;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-text-muted);
  background: none;
  border: 1px dashed var(--slb-color-border);
  border-radius: var(--slb-radius-sm);
  cursor: pointer;

  &:hover {
    color: var(--slb-color-primary);
    border-color: var(--slb-color-primary);
  }
}
</style>

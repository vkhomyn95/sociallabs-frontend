<script setup lang="ts">
import { ref, watch } from 'vue'

/** The workflow name, renamed in place: Enter or leaving the field commits, an empty name is reverted. */
const props = defineProps<{ name: string }>()
const emit = defineEmits<{ rename: [name: string] }>()

const value = ref(props.name)
watch(
  () => props.name,
  (name) => (value.value = name),
)

function commit(): void {
  const next = value.value.trim()
  if (next && next !== props.name) emit('rename', next)
  else value.value = props.name
}
</script>

<template>
  <input
    v-model="value"
    class="wf-name-input"
    aria-label="Workflow name"
    @keydown.enter="($event.target as HTMLInputElement).blur()"
    @keydown.esc="(value = name), ($event.target as HTMLInputElement).blur()"
    @blur="commit"
  />
</template>

<style scoped lang="scss">
// Looks like the current crumb of SlbBreadcrumb until it is hovered or focused.
.wf-name-input {
  min-width: 120px;
  max-width: 320px;
  padding: var(--slb-space-xs) var(--slb-space-sm);
  font-family: var(--slb-font-family);
  font-size: var(--slb-font-base);
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-gray-900);
  text-overflow: ellipsis;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--slb-radius-sm);

  &:hover,
  &:focus {
    border-color: var(--slb-color-border);
    outline: none;
  }
}
</style>

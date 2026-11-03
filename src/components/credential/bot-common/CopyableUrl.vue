<script setup lang="ts">
import { SlbButton, slbToast } from '@sociallabs/frontend-components'

/** An address shown in one line, with a button that copies it. */
const props = defineProps<{
  url: string
  /** What the address is, for the copy button and the toast. */
  name: string
}>()

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(props.url)
    slbToast.success(`${props.name} copied`)
  } catch {
    slbToast.error('Could not copy the address')
  }
}
</script>

<template>
  <span class="slb-copyable-url">
    <code class="slb-copyable-url__text" :title="url">{{ url }}</code>
    <SlbButton variant="ghost" size="sm" icon-only icon-left="action_copy" :aria-label="`Copy the ${name.toLowerCase()}`" @click="copy" />
  </span>
</template>

<style scoped lang="scss">
.slb-copyable-url {
  display: inline-flex;
  gap: var(--slb-space-sm);
  align-items: center;
  min-width: 0;

  &__text {
    overflow: hidden;
    font-size: var(--slb-font-xs);
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>

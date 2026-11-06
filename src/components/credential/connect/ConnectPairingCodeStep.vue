<script setup lang="ts">
import { computed } from 'vue'
import { SlbButton, slbToast } from '@sociallabs/frontend-components'

/** A code to enter on the phone, shown large, with where to enter it. */
const props = defineProps<{ code: string; message: string; instructions: string[] }>()

/** WhatsApp shows its codes as two groups of four; the code is kept as sent. */
const GROUP = 4

const shown = computed(() => {
  const plain = props.code.replace(/[^A-Za-z0-9]/g, '')
  if (plain.length !== GROUP * 2) return props.code
  return `${plain.slice(0, GROUP)}-${plain.slice(GROUP)}`
})

async function copy(): Promise<void> {
  try {
    await navigator.clipboard.writeText(shown.value)
    slbToast.success('Code copied')
  } catch {
    slbToast.error('Could not copy the code')
  }
}
</script>

<template>
  <div class="slb-cred-connect">
    <div class="slb-cred-pairing">
      <code class="slb-cred-pairing__code" data-test="pairing-code">{{ shown }}</code>
      <SlbButton variant="ghost" size="sm" icon-only icon-left="action_copy" aria-label="Copy the code" @click="copy" />
    </div>
    <p v-if="message" class="slb-cred-connect__message">{{ message }}</p>
    <ol v-if="instructions.length" class="slb-cred-connect__steps">
      <li v-for="step in instructions" :key="step">{{ step }}</li>
    </ol>
  </div>
</template>

<style scoped lang="scss">
.slb-cred-pairing {
  display: inline-flex;
  gap: var(--slb-space-sm);
  align-items: center;
  padding: var(--slb-space-md) var(--slb-space-lg);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-lg);
  background: var(--slb-color-surface);
}

.slb-cred-pairing__code {
  font-family: var(--slb-font-mono, ui-monospace, monospace);
  font-size: 28px;
  font-weight: var(--slb-fw-semibold, 600);
  letter-spacing: 0.12em;
  color: var(--slb-color-text);
}
</style>

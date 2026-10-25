<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { QrFormat } from '@/stores/credential/types'

const props = defineProps<{ value: string; format: QrFormat; instructions: string[] }>()

const QR_OPTIONS = { margin: 1, width: 192 } as const

const src = ref<string | null>(null)

// Links are encoded client-side; qrcode is loaded lazily as a separate chunk.
watchEffect(async () => {
  if (props.format === QrFormat.IMAGE) {
    src.value = props.value
    return
  }
  const { toDataURL } = await import('qrcode')
  src.value = await toDataURL(props.value, QR_OPTIONS)
})
</script>

<template>
  <div class="slb-cred-connect">
    <img v-if="src" :src="src" alt="QR code to sign in" class="slb-cred-connect__qr" />
    <ol v-if="instructions.length" class="slb-cred-connect__steps">
      <li v-for="step in instructions" :key="step">{{ step }}</li>
    </ol>
  </div>
</template>

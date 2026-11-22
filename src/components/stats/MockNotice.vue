<script setup lang="ts">
import { SlbAlert } from '@sociallabs/frontend-components'

// Позначка на макетних сторінках: дані вигадані, бекенду ще немає.
defineProps<{ text?: string }>()
</script>

<template>
  <SlbAlert variant="info" title="Preview" class="mock-notice">
    {{ text ?? 'Mock data — this section is a layout of a future feature, nothing here is saved or sent.' }}
  </SlbAlert>
</template>

<style scoped lang="scss">
.mock-notice { margin-bottom: 16px; }
</style>

<template>
  <div class="slb-node-panel__state slb-node-panel__state--error">
    <i class="fas fa-exclamation-circle"></i>
    <p>{{ message }}</p>
    <button class="slb-node-panel__retry-btn" @click="$emit('retry')">
      <i class="fas fa-redo"></i>
      Retry
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  message: string
}>()

defineEmits<{
  retry: []
}>()
</script>

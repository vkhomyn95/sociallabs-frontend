<template>
  <div class="slb-node-panel__search">
    <i class="fas fa-search slb-node-panel__search-icon"></i>
    <input
      :value="modelValue"
      type="text"
      class="slb-node-panel__search-input"
      placeholder="Search nodes..."
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button
      v-if="modelValue"
      class="slb-node-panel__search-clear"
      aria-label="Clear search"
      @click="$emit('update:modelValue', '')"
    >
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

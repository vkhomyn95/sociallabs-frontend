<script setup lang="ts">
defineProps({
  id: { type: String, required: true },
  type: { type: String, required: true }, // 'arrow' | 'diamond' | 'circle' | 'square'
  stroke: { type: String, default: '#9ca3af' },
  fill: { type: String, default: '#9ca3af' },
  strokeWidth: { type: Number, default: 1 },
  width: { type: Number, default: 12 },
  height: { type: Number, default: 12 },
})
</script>

<template>
  <svg class="vue-flow__marker vue-flow__container">
    <defs>
      <marker
        :id="id"
        class="vue-flow__arrowhead"
        viewBox="-10 -10 20 20"
        refX="0"
        refY="0"
        :markerWidth="width"
        :markerHeight="height"
        markerUnits="strokeWidth"
        orient="auto-start-reverse"
      >
        <!-- ← новий тип: чиста стрілка (як у n8n) -->
        <path
          v-if="type === 'arrow'"
          :style="{ stroke, strokeWidth }"
          stroke-linecap="round"
          stroke-linejoin="round"
          :fill="fill"
          d="M -6 -5 L 0 0 L -6 5 Z"
        />
        <path
          v-else-if="type === 'diamond'"
          :style="{ stroke, strokeWidth }"
          stroke-linecap="round"
          stroke-linejoin="round"
          :fill="fill"
          d="M 0,-5 L 5,0 L 0,5 L -5,0 Z"
        />
        <circle v-else-if="type === 'circle'" :style="{ stroke, strokeWidth }" :fill="fill" r="4" />
        <rect
          v-else-if="type === 'square'"
          :style="{ stroke, strokeWidth }"
          :fill="fill"
          x="-4"
          y="-4"
          width="8"
          height="8"
        />
      </marker>
    </defs>
  </svg>
</template>

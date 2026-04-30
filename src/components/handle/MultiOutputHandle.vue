<script setup lang="ts">
import { computed } from 'vue'
import OutputRow from '@/components/handle/OutputRow.vue'

export interface OutputPort {
  id: string
  label: string
  color: string
}

const props = defineProps<{
  nodeId: string
  outputs: OutputPort[]
  rowHeight?: number
}>()

const ROW = computed(() => props.rowHeight ?? 36)

const rows = computed(() => {
  const count = props.outputs.length
  const total = (count - 1) * ROW.value
  return props.outputs.map((out, i) => ({
    ...out,
    offsetY: -total / 2 + i * ROW.value,
  }))
})
</script>

<template>
  <div class="slb_moh">
    <div
      v-for="row in rows"
      :key="row.id"
      class="slb_moh__row"
      :style="{ top: `calc(50% + ${row.offsetY}px)` }"
    >
      <OutputRow :node-id="nodeId" :handle-id="row.id" :color="row.color" :label="row.label" />
    </div>
  </div>
</template>

<style scoped lang="scss">
.slb_moh {
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 0;
  pointer-events: none;
  overflow: visible;
}

.slb_moh__row {
  position: absolute;
  left: 0;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: none;
  overflow: visible;
}
</style>

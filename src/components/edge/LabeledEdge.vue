<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  MarkerType,
  useNodesData,
  useVueFlow,
} from '@vue-flow/core'
import CustomMarker from '@/components/markers/CustomMarker.vue'

const props = defineProps<{
  id: string
  source: string
  target: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: string
  targetPosition: string
  data?: {
    color?: string
    label?: string
    isSubEdge?: boolean
    dashed?: boolean
    isAnimating?: boolean
    connectionId?: string
  }
  selected?: boolean
}>()

const emit = defineEmits<{
  remove: [edgeId: string]
}>()

const { updateEdgeData } = useVueFlow()

// ── Node status ──
const nodesData = useNodesData(() => [props.target, props.source])
const targetData = computed(() => nodesData.value[0]?.data)
const sourceData = computed(() => nodesData.value[1]?.data)

const markerId = computed(() => `edge-marker-${props.id}`)

// ── Path ──
const pathResult = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition as any,
    targetPosition: props.targetPosition as any,
    borderRadius: 12,
  }),
)

const pathD = computed(() => pathResult.value[0])
const midX = computed(() => pathResult.value[1])
const midY = computed(() => pathResult.value[2])

// Label position: near source (20% along the path approximated by offset from source)
// Замість лінійної інтерполяції — беремо точку ~15% від початку по реальному шляху
// Найпростіше: зміщення від sourceX вздовж горизонталі першого сегменту
const labelX = computed(() => props.sourceX + 36)
const labelY = computed(() => props.sourceY)

// ── Edge color based on execution status ──
const edgeColor = computed(() => {
  const status = targetData.value?.status
  switch (status) {
    case 'error':
      return '#ef4444'
    case 'finished':
      return '#10b981'
    case 'cancelled':
    case 'skipped':
      return '#f59e0b'
    case 'running':
      return '#3b82f6'
    default:
      return props.data?.color ?? '#9ca3af'
  }
})

const strokeDash = computed(() => (props.data?.dashed ? '5 4' : undefined))
const strokeWidth = computed(() => (targetData.value?.status === 'running' ? 2.5 : 1.5))

// ── Hover state for delete ──
const isHovered = ref(false)

// ── Animation packet ──
const isAnimating = computed({
  get: () => props.data?.isAnimating ?? false,
  set: (val) => updateEdgeData(props.id, { isAnimating: val }),
})

const labelRef = ref<HTMLElement>()
const edgeRef = ref<any>()
let animation: Animation | null = null

watch(
  () => targetData.value?.status === 'cancelled',
  (c) => {
    if (c) animation?.cancel()
  },
)

watch(
  () => sourceData.value?.status === 'finished',
  (f) => {
    if (f) runAnimation()
  },
)

function runAnimation() {
  const pathEl = edgeRef.value?.pathEl
  const labelEl = labelRef.value
  if (!pathEl || !labelEl) return
  const len = pathEl.getTotalLength()
  isAnimating.value = true
  nextTick(() => {
    const anim = labelEl.animate([{ offsetDistance: '0%' }, { offsetDistance: '100%' }], {
      duration: Math.min(Math.max(len * 8, 800), 2500),
      easing: 'ease-in-out',
      iterations: 1,
    })
    const end = () => {
      isAnimating.value = false
    }
    anim.onfinish = end
    anim.oncancel = end
    animation = anim
  })
}
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <!-- Wide invisible hover target -->
  <path
    :d="pathD"
    fill="none"
    stroke="transparent"
    stroke-width="18"
    style="cursor: pointer"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  />

  <!-- Actual edge -->
  <BaseEdge
    ref="edgeRef"
    :id="id"
    :path="pathD"
    :marker-end="`url(#${markerId})`"
    :style="{
      stroke: edgeColor,
      strokeWidth,
      strokeDasharray: strokeDash,
      transition: 'stroke 0.3s, stroke-width 0.2s',
    }"
  />

  <CustomMarker
    :id="markerId"
    type="arrow"
    :stroke="edgeColor"
    :fill="edgeColor"
    :stroke-width="1"
    :width="14"
    :height="14"
  />

  <EdgeLabelRenderer>
    <!-- Output label near source (n8n style) -->
    <div
      v-if="data?.label"
      class="slb_labeled-edge__label"
      :style="{
        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
        color: edgeColor,
        borderColor: edgeColor,
        pointerEvents: 'none',
      }"
    >
      {{ data.label }}
    </div>

    <!-- Animated packet -->
    <div
      ref="labelRef"
      :style="{
        visibility: isAnimating ? 'visible' : 'hidden',
        position: 'absolute',
        zIndex: 5,
        offsetPath: `path('${pathD}')`,
        offsetRotate: '0deg',
        offsetAnchor: 'center',
        pointerEvents: 'none',
      }"
    >
      <div class="slb_labeled-edge__packet" :style="{ background: edgeColor }"></div>
    </div>

    <!-- Hover delete button at midpoint -->
    <Transition name="slb-edge-fade">
      <div
        v-if="isHovered"
        class="slb_labeled-edge__delete"
        :style="{
          transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)`,
          pointerEvents: 'all',
        }"
        @mouseenter="isHovered = true"
        @mouseleave="isHovered = false"
        @click.stop="emit('remove', id)"
      >
        <i class="fas fa-times"></i>
      </div>
    </Transition>
  </EdgeLabelRenderer>
</template>

<style scoped lang="scss">
.slb_labeled-edge {
  &__label {
    position: absolute;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.5px;
    background: white;
    border: 1.5px solid;
    border-radius: 4px;
    padding: 2px 6px;
    white-space: nowrap;
    line-height: 1.4;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  }

  &__packet {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    box-shadow: 0 0 8px currentColor;
  }

  &__delete {
    position: absolute;
    width: 22px;
    height: 22px;
    background: white;
    border: 1.5px solid #ef4444;
    color: #ef4444;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    cursor: pointer;
    z-index: 10;
    transition:
      background 0.15s,
      color 0.15s;
    box-shadow: 0 2px 8px rgba(239, 68, 68, 0.25);

    &:hover {
      background: #ef4444;
      color: white;
    }
  }
}

.slb-edge-fade-enter-active,
.slb-edge-fade-leave-active {
  transition: opacity 0.15s;
}
.slb-edge-fade-enter-from,
.slb-edge-fade-leave-to {
  opacity: 0;
}
</style>

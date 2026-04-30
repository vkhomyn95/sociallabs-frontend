<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useNodesData,
  useVueFlow,
} from '@vue-flow/core'

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

// ─────────────────────────────────────────────
// Node data for status
// ─────────────────────────────────────────────
const nodesData = useNodesData(() => [props.target, props.source])
const targetData = computed(() => nodesData.value[0]?.data)
const sourceData = computed(() => nodesData.value[1]?.data)

// ─────────────────────────────────────────────
// Path
// ─────────────────────────────────────────────
const path = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
    sourcePosition: props.sourcePosition as any,
    targetPosition: props.targetPosition as any,
  }),
)

// ─────────────────────────────────────────────
// Colors based on execution status
// ─────────────────────────────────────────────
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

const strokeDasharray = computed(() => (props.data?.dashed ? '5 4' : undefined))

const strokeWidth = computed(() => (targetData.value?.status === 'running' ? 2.5 : 1.5))

// ─────────────────────────────────────────────
// Hover delete
// ─────────────────────────────────────────────
const isHovered = ref(false)

// ─────────────────────────────────────────────
// Animation (packet travelling along edge)
// ─────────────────────────────────────────────
const isAnimating = computed({
  get: () => props.data?.isAnimating ?? false,
  set: (val) => updateEdgeData(props.id, { isAnimating: val }),
})

const labelRef = ref<HTMLElement>()
const edgeRef = ref<any>()
let animation: Animation | null = null

watch(
  () => targetData.value?.status === 'cancelled',
  (isCancelled) => {
    if (isCancelled) animation?.cancel()
  },
)

watch(
  () => sourceData.value?.status === 'finished',
  (isFinished) => {
    if (isFinished) runAnimation()
  },
)

function runAnimation() {
  const pathEl = edgeRef.value?.pathEl
  const labelEl = labelRef.value
  if (!pathEl || !labelEl) return

  const totalLength = pathEl.getTotalLength()
  isAnimating.value = true

  nextTick(() => {
    const keyframes = [{ offsetDistance: '0%' }, { offsetDistance: '100%' }]
    const duration = Math.min(Math.max(totalLength * 8, 800), 2500)

    const anim = labelEl.animate(keyframes, {
      duration,
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

// Label midpoint for delete button
const midX = computed(() => path.value[1])
const midY = computed(() => path.value[2])
</script>

<script lang="ts">
export default { inheritAttrs: false }
</script>

<template>
  <!-- Invisible wide hover target -->
  <path
    :d="path[0]"
    fill="none"
    stroke="transparent"
    stroke-width="20"
    style="cursor: pointer"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  />

  <!-- Actual visible edge -->
  <BaseEdge
    ref="edgeRef"
    :id="id"
    :path="path[0]"
    :style="{
      stroke: edgeColor,
      strokeWidth,
      strokeDasharray,
      transition: 'stroke 0.3s, stroke-width 0.2s',
    }"
  />

  <!-- Animated packet dot -->
  <EdgeLabelRenderer>
    <div
      ref="labelRef"
      :style="{
        visibility: isAnimating ? 'visible' : 'hidden',
        position: 'absolute',
        zIndex: 5,
        offsetPath: `path('${path[0]}')`,
        offsetRotate: '0deg',
        offsetAnchor: 'center',
        pointerEvents: 'none',
      }"
    >
      <div class="slb_workflow-edge__packet" :style="{ background: edgeColor }"></div>
    </div>

    <!-- Hover delete button -->
    <Transition name="slb-edge-fade">
      <div
        v-if="isHovered"
        class="slb_workflow-edge__delete"
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
.slb_workflow-edge {
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

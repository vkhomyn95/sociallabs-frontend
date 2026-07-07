<script setup lang="ts">
import { reactive, computed, watch } from 'vue'
import { SlbTab } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import { ref } from 'vue'
import type { NodeInstance } from '@/stores/node/types'
import {
  type IfLogicParams,
  type IfCondition,
  IfCombineOperation,
  emptyCondition,
} from './index'
import IfConditionRow from '@/engine/nodes/if-logic/components/IfConditionRow.vue'

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('conditions')

const TABS: TabItem[] = [
  { key: 'conditions', label: 'Conditions', icon: 'fas fa-filter'  },
  { key: 'settings',   label: 'Settings',   icon: 'fas fa-cog'     },
]

const params = reactive<IfLogicParams>({
  combineOperation: props.node.parameters?.combineOperation ?? IfCombineOperation.AND,
  conditions:       props.node.parameters?.conditions       ?? [],
})

function push() {
  emit('update:node', {
    ...props.node,
    parameters: { ...props.node.parameters, ...params },
  })
}

watch(params, push, { deep: true })

watch(
  () => props.node.parameters,
  (p) => {
    if (!p) return
    params.combineOperation = p.combineOperation ?? IfCombineOperation.AND
    params.conditions       = p.conditions       ?? []
  },
  { deep: true }
)

const showCombine = computed(() => params.conditions.length > 1)

function addCondition() {
  params.conditions = [...params.conditions, emptyCondition()]
}

function removeCondition(idx: number) {
  params.conditions = params.conditions.filter((_, i) => i !== idx)
}

function updateCondition(idx: number, updated: IfCondition) {
  params.conditions = params.conditions.map((c, i) => (i === idx ? updated : c))
}
</script>

<template>
  <SlbTab v-model="activeTab" :tabs="TABS" variant="line">

    <!-- ── Conditions ── -->
    <template #conditions>
      <div class="if-panel">
        <div class="if-panel__intro">
          <p class="if-panel__desc">
            Items matching all conditions go to the
            <span class="if-panel__badge if-panel__badge--true">True</span>
            output. All others go to
            <span class="if-panel__badge if-panel__badge--false">False</span>.
          </p>
        </div>

        <!-- AND / OR toggle (only when 2+ conditions) -->
        <div v-if="showCombine" class="if-combine">
          <button
            class="if-combine__btn"
            :class="{ 'if-combine__btn--active': params.combineOperation === IfCombineOperation.AND }"
            @click="params.combineOperation = IfCombineOperation.AND"
          >AND</button>
          <button
            class="if-combine__btn"
            :class="{ 'if-combine__btn--active': params.combineOperation === IfCombineOperation.OR }"
            @click="params.combineOperation = IfCombineOperation.OR"
          >OR</button>
          <span class="if-combine__hint">
            {{ params.combineOperation === 'AND' ? 'All must match' : 'Any must match' }}
          </span>
        </div>

        <!-- Condition rows -->
        <div class="if-panel__conditions">
          <IfConditionRow
            v-for="(cond, idx) in params.conditions"
            :key="idx"
            :condition="cond"
            :index="idx"
            @update:condition="updateCondition(idx, $event)"
            @remove="removeCondition(idx)"
          />

          <div v-if="!params.conditions.length" class="if-empty">
            <i class="fas fa-filter"></i>
            No conditions yet — add one below
          </div>
        </div>

        <button class="if-add-btn" @click="addCondition">
          <i class="fas fa-plus"></i>
          Add condition
        </button>
      </div>
    </template>

    <!-- ── Settings ── -->
    <template #settings>
      <div class="if-panel__settings">
        <p class="if-panel__settings-hint">
          No additional settings for the IF node.
        </p>
      </div>
    </template>

  </SlbTab>
</template>

<style lang="scss">
@use './index.scss';
@use '@/components/ui/variables' as *;

.if-panel {
  display: flex;
  flex-direction: column;
  gap: $slb-ui-space-8;
  padding: 0 $slb-ui-space-5;

  &__intro { }

  &__desc {
    font-size: $slb-ui-font-sm;
    color: $slb-ui-gray-500;
    margin: 0;
    line-height: 1.6;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 1px 8px;
    border-radius: $slb-ui-radius-full;
    font-size: $slb-ui-font-xs;
    font-weight: $slb-ui-fw-semibold;

    &--true  { background: $slb-ui-success-light; color: $slb-ui-success; }
    &--false { background: $slb-ui-error-light;   color: $slb-ui-error;   }
  }

  &__conditions {
    display: flex;
    flex-direction: column;
    gap: $slb-ui-space-3;
  }

  &__settings {
    padding: $slb-ui-space-4 0;
  }

  &__settings-hint {
    font-size: $slb-ui-font-sm;
    color: $slb-ui-gray-400;
    margin: 0;
  }
}
</style>

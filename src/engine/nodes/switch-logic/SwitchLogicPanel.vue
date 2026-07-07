<script setup lang="ts">
/**
 * SwitchLogicPanel.vue
 * Рендериться через <component :is> у NodeEditorCenterPanel.
 */
import { reactive, watch, ref } from 'vue'
import { SlbTab, SlbInput, SlbCheckbox } from '@/components/ui'
import type { TabItem } from '@/components/ui/tab/useTab'
import type { NodeInstance } from '@/stores/node/types'
import {
  type SwitchLogicParams,
  type SwitchRule,
  SwitchMode,
  emptyRule,
} from './index'
import SwitchRuleBlock from "./components/SwitchRuleBlock.vue"

const props = defineProps<{ node: NodeInstance }>()
const emit  = defineEmits<{ 'update:node': [NodeInstance] }>()

const activeTab = ref('routing')

const TABS: TabItem[] = [
  { key: 'routing',  label: 'Routing',  icon: 'fas fa-random' },
  { key: 'settings', label: 'Settings', icon: 'fas fa-cog'    },
]

const params = reactive<SwitchLogicParams>({
  mode:            props.node.parameters?.mode            ?? SwitchMode.RULES,
  rules:           props.node.parameters?.rules           ?? [],
  expression:      props.node.parameters?.expression      ?? '',
  fallbackEnabled: props.node.parameters?.fallbackEnabled ?? true,
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
    params.mode            = p.mode            ?? SwitchMode.RULES
    params.rules           = p.rules           ?? []
    params.expression      = p.expression      ?? ''
    params.fallbackEnabled = p.fallbackEnabled ?? true
  },
  { deep: true }
)

function addRule() {
  params.rules = [...params.rules, emptyRule(params.rules.length)]
}

function removeRule(idx: number) {
  params.rules = params.rules
    .filter((_, i) => i !== idx)
    .map((r, i) => ({ ...r, outputIndex: i }))
}

function updateRule(idx: number, updated: SwitchRule) {
  params.rules = params.rules.map((r, i) => (i === idx ? updated : r))
}
</script>

<template>
  <SlbTab v-model="activeTab" :tabs="TABS" variant="line">

    <!-- ── Routing ── -->
    <template #routing>
      <div class="sw-panel">

        <!-- Mode toggle -->
        <div class="sw-panel__mode">
          <div class="sw-mode">
            <button
              class="sw-mode__card"
              :class="{ 'sw-mode__card--active': params.mode === SwitchMode.RULES }"
              @click="params.mode = SwitchMode.RULES"
            >
              <span class="sw-mode__card-name">Rules</span>
              <span class="sw-mode__card-desc">Route items based on condition rules</span>
            </button>
            <button
              class="sw-mode__card"
              :class="{ 'sw-mode__card--active': params.mode === SwitchMode.EXPRESSION }"
              @click="params.mode = SwitchMode.EXPRESSION"
            >
              <span class="sw-mode__card-name">Expression</span>
              <span class="sw-mode__card-desc">Evaluate to get output port index</span>
            </button>
          </div>
        </div>

        <!-- Rules mode -->
        <template v-if="params.mode === SwitchMode.RULES">
          <div v-if="!params.rules.length" class="sw-empty">
            <i class="fas fa-random"></i>
            No outputs yet — add one below
          </div>

          <SwitchRuleBlock
            v-for="(rule, idx) in params.rules"
            :key="idx"
            :rule="rule"
            :index="idx"
            @update:rule="updateRule(idx, $event)"
            @remove="removeRule(idx)"
          />

          <button class="sw-add-rule-btn" @click="addRule">
            <i class="fas fa-plus"></i>
            Add output
          </button>
        </template>

        <!-- Expression mode -->
        <template v-else>
          <div class="sw-panel__expr-wrap">
            <p class="sw-panel__expr-desc">
              Expression must evaluate to a port index (0, 1, 2...).
              Items go to the matching output port.
            </p>
            <SlbInput
              v-model="params.expression"
              placeholder="{{$json.status}}"
            />
          </div>
        </template>

      </div>
    </template>

    <!-- ── Settings ── -->
    <template #settings>
      <div class="sw-panel__settings">
        <SlbCheckbox
          v-model="params.fallbackEnabled"
          label="Add Fallback Output"
          description="Items that match no rule are routed to a fallback port"
        />
      </div>
    </template>

  </SlbTab>
</template>

<style lang="scss">
@use './index.scss';
@use '@/components/ui/variables' as *;

.sw-panel {
  display: flex;
  flex-direction: column;
  gap: $slb-ui-space-8;
  padding: 0 $slb-ui-space-5;

  &__mode { }

  &__expr-wrap {
    display: flex;
    flex-direction: column;
    gap: $slb-ui-space-4;
  }

  &__expr-desc {
    font-size: $slb-ui-font-sm;
    color: $slb-ui-gray-500;
    margin: 0;
    line-height: 1.5;
  }

  &__settings {
    padding: $slb-ui-space-4 0;
    display: flex;
    flex-direction: column;
    gap: $slb-ui-space-6;
  }
}
</style>

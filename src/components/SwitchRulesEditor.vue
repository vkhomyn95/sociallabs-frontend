<template>
  <div class="switch-rules-editor">

    <div v-for="(rule, idx) in safeValue" :key="idx" class="rule-block">

      <!-- Rule header -->
      <div class="rule-header">
        <span class="output-badge" :style="{ background: getOutputColor(idx) }">
          {{ idx + 1 }}
        </span>
        <input
          :value="rule.outputName"
          class="rule-input rule-input--name"
          placeholder="Output name"
          @input="updateRule(idx, 'outputName', ($event.target as HTMLInputElement).value)"
        />
        <!-- AND / OR між умовами всередині правила -->
        <div class="combine-toggle">
          <button
            :class="['ctoggle', { active: (rule.combineOperation || 'AND') === 'AND' }]"
            @click="updateRule(idx, 'combineOperation', 'AND')"
          >AND</button>
          <button
            :class="['ctoggle', { active: rule.combineOperation === 'OR' }]"
            @click="updateRule(idx, 'combineOperation', 'OR')"
          >OR</button>
        </div>
        <button class="rule-remove" @click="removeRule(idx)" title="Remove output">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <!-- Conditions inside rule -->
      <div class="rule-conditions">
        <div
          v-for="(cond, cidx) in rule.conditions"
          :key="cidx"
          class="condition-row"
        >
          <span class="cond-badge">{{ cidx + 1 }}</span>

          <!-- Left value -->
          <input
            :value="cond.leftValue"
            class="cond-input cond-input--expr"
            placeholder="{{$json.field}} or value"
            @input="updateCondition(idx, cidx, 'leftValue', ($event.target as HTMLInputElement).value)"
          />

          <!-- Operation -->
          <select
            :value="cond.operation"
            class="cond-select"
            @change="updateCondition(idx, cidx, 'operation', ($event.target as HTMLSelectElement).value)"
          >
            <optgroup label="── String ──">
              <option :value="LogicOperation.EQUALS">equals</option>
              <option :value="LogicOperation.NOT_EQUALS">not equals</option>
              <option :value="LogicOperation.CONTAINS">contains</option>
              <option :value="LogicOperation.NOT_CONTAINS">not contains</option>
              <option :value="LogicOperation.STARTS_WITH">starts with</option>
              <option :value="LogicOperation.ENDS_WITH">ends with</option>
              <option :value="LogicOperation.IS_EMPTY">is empty</option>
              <option :value="LogicOperation.IS_NOT_EMPTY">is not empty</option>
              <option :value="LogicOperation.REGEX">regex match</option>
            </optgroup>
            <optgroup label="── Number ──">
              <option :value="LogicOperation.GT">greater than</option>
              <option :value="LogicOperation.LT">less than</option>
              <option :value="LogicOperation.GTE">≥</option>
              <option :value="LogicOperation.LTE">≤</option>
            </optgroup>
            <optgroup label="── Boolean ──">
              <option :value="LogicOperation.IS_TRUE">is true</option>
              <option :value="LogicOperation.IS_FALSE">is false</option>
            </optgroup>
          </select>

          <!-- Right value -->
          <input
            v-if="needsRightValue(cond.operation)"
            :value="cond.rightValue"
            class="cond-input cond-input--value"
            placeholder="value"
            @input="updateCondition(idx, cidx, 'rightValue', ($event.target as HTMLInputElement).value)"
          />
          <div v-else class="cond-spacer" />

          <button class="cond-remove" @click="removeCondition(idx, cidx)">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <!-- Add condition to this rule -->
        <button class="add-condition-btn" @click="addCondition(idx)">
          <i class="fas fa-plus"></i> Add condition
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="safeValue.length === 0" class="rules-empty">
      <i class="fas fa-random"></i>
      <span>No outputs yet — add one below</span>
    </div>

    <!-- Add rule (output) -->
    <button class="add-rule-btn" @click="addRule">
      <i class="fas fa-plus"></i> Add output
    </button>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LogicOperation } from '@/stores/node/definitions/if-logic'
import type { SwitchRule, SwitchCondition } from '@/stores/node/definitions/switch-logic'

const props = defineProps<{
  modelValue?: SwitchRule[] | null
}>()

const emit = defineEmits<{
  'update:modelValue': [SwitchRule[]]
}>()

const OUTPUT_COLORS = ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6', '#06b6d4', '#6366f1']

const safeValue = computed((): SwitchRule[] =>
  Array.isArray(props.modelValue) ? props.modelValue : []
)

function getOutputColor(idx: number) {
  return OUTPUT_COLORS[idx % OUTPUT_COLORS.length]
}

function needsRightValue(op: string): boolean {
  return ![
    LogicOperation.IS_EMPTY,
    LogicOperation.IS_NOT_EMPTY,
    LogicOperation.IS_TRUE,
    LogicOperation.IS_FALSE,
  ].includes(op as LogicOperation)
}

// ── Rule level ────────────────────────────────────────────────

function addRule() {
  const idx = safeValue.value.length
  const newRule: SwitchRule = {
    outputIndex:      idx,
    outputName:       `Output ${idx + 1}`,
    conditions:       [emptyCondition()],
    combineOperation: 'AND',
  }
  emit('update:modelValue', [...safeValue.value, newRule])
}

function removeRule(idx: number) {
  const updated = safeValue.value
    .filter((_, i) => i !== idx)
    .map((r, i) => ({ ...r, outputIndex: i }))
  emit('update:modelValue', updated)
}

function updateRule<K extends keyof SwitchRule>(
  idx: number,
  field: K,
  value: SwitchRule[K]
) {
  const updated = safeValue.value.map((r, i) =>
    i === idx ? { ...r, [field]: value } : r
  )
  emit('update:modelValue', updated)
}

// ── Condition level ───────────────────────────────────────────

function emptyCondition(): SwitchCondition {
  return {
    leftValue:        '',
    operation:        LogicOperation.EQUALS,
    rightValue:       '',
    type:             'STRING',
  }
}

function addCondition(ruleIdx: number) {
  const rule = safeValue.value[ruleIdx]
  updateRule(ruleIdx, 'conditions', [...rule.conditions, emptyCondition()])
}

function removeCondition(ruleIdx: number, condIdx: number) {
  const rule = safeValue.value[ruleIdx]
  updateRule(
    ruleIdx,
    'conditions',
    rule.conditions.filter((_, i) => i !== condIdx)
  )
}

function updateCondition<K extends keyof SwitchCondition>(
  ruleIdx: number,
  condIdx: number,
  field: K,
  value: SwitchCondition[K]
) {
  const rule = safeValue.value[ruleIdx]
  const updated = rule.conditions.map((c, i) =>
    i === condIdx ? { ...c, [field]: value } : c
  )
  updateRule(ruleIdx, 'conditions', updated)
}
</script>

<style scoped>
.switch-rules-editor {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.rule-block {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.output-badge {
  width: 20px; height: 20px; flex-shrink: 0;
  border-radius: 50%; font-size: 10px; font-weight: 800;
  color: white; display: flex; align-items: center; justify-content: center;
}

.rule-input {
  padding: 5px 8px; border: 1px solid #e5e7eb; border-radius: 5px;
  font-size: 12px; color: #111827; font-family: inherit;
}
.rule-input--name { flex: 1; min-width: 0; }
.rule-input:focus { outline: none; border-color: #6366f1; }

.combine-toggle {
  display: flex;
  gap: 2px;
}
.ctoggle {
  padding: 3px 8px; border-radius: 4px; border: 1px solid #d1d5db;
  background: transparent; font-size: 10px; font-weight: 700;
  cursor: pointer; color: #6b7280; font-family: inherit;
}
.ctoggle.active { background: #6366f1; color: white; border-color: #6366f1; }

.rule-remove {
  width: 24px; height: 24px; flex-shrink: 0;
  border: 1px solid #fecaca; border-radius: 4px;
  background: transparent; color: #f87171;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 10px;
}
.rule-remove:hover { background: #fee2e2; color: #ef4444; }

/* Conditions inside rule */
.rule-conditions {
  padding: 8px 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.condition-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cond-badge {
  width: 16px; height: 16px; flex-shrink: 0;
  background: #f3f4f6; border-radius: 50%;
  font-size: 9px; font-weight: 700; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
}

.cond-input {
  padding: 5px 8px; border: 1px solid #e5e7eb; border-radius: 5px;
  font-size: 11px; color: #111827; font-family: 'JetBrains Mono', monospace;
}
.cond-input:focus { outline: none; border-color: #6366f1; }
.cond-input--expr  { flex: 2; min-width: 0; }
.cond-input--value { flex: 1.5; min-width: 0; }
.cond-spacer { flex: 1.5; }

.cond-select {
  flex: 1.5; min-width: 0;
  padding: 5px 6px; border: 1px solid #e5e7eb; border-radius: 5px;
  font-size: 11px; font-family: inherit; color: #374151; background: white;
  cursor: pointer;
}
.cond-select:focus { outline: none; border-color: #6366f1; }

.cond-remove {
  width: 22px; height: 22px; flex-shrink: 0;
  border: 1px solid #fecaca; border-radius: 4px;
  background: transparent; color: #f87171;
  cursor: pointer; display: flex; align-items: center;
  justify-content: center; font-size: 10px;
}
.cond-remove:hover { background: #fee2e2; color: #ef4444; }

.add-condition-btn {
  padding: 5px 10px;
  border: 1px dashed #d1d5db; border-radius: 5px;
  background: transparent; color: #9ca3af;
  font-size: 11px; cursor: pointer;
  display: flex; align-items: center; gap: 5px;
  font-family: inherit; align-self: flex-start;
}
.add-condition-btn:hover { border-color: #6366f1; color: #6366f1; }

.rules-empty {
  display: flex; align-items: center; gap: 8px;
  padding: 12px; border-radius: 8px;
  background: #f9fafb; color: #9ca3af; font-size: 12px;
}

.add-rule-btn {
  padding: 7px 12px;
  border: 1.5px dashed #d1d5db; border-radius: 7px;
  background: transparent; color: #9ca3af;
  font-size: 12px; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  font-family: inherit;
}
.add-rule-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
</style>

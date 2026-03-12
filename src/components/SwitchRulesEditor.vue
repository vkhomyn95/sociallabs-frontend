<template>
  <div class="switch-rules-editor">

    <!-- Rules list -->
    <div
      v-for="(rule, idx) in safeValue"
      :key="rule.outputIndex"
      class="rule-row"
    >
      <!-- Colored output badge -->
      <span class="output-badge" :style="{ background: getOutputColor(idx) }">
        {{ idx + 1 }}
      </span>

      <!-- Output label name -->
      <input
        :value="rule.outputName"
        class="rule-input rule-input--name"
        placeholder="Output name"
        @input="updateRule(idx, 'outputName', ($event.target as HTMLInputElement).value)"
      />

      <!-- Operation -->
      <select
        :value="rule.operation"
        class="rule-select"
        @change="updateRule(idx, 'operation', ($event.target as HTMLSelectElement).value)"
      >
        <option value="EQUALS">equals</option>
        <option value="NOT_EQUALS">not equals</option>
        <option value="CONTAINS">contains</option>
        <option value="STARTS_WITH">starts with</option>
        <option value="ENDS_WITH">ends with</option>
        <option value="GT">greater than</option>
        <option value="LT">less than</option>
        <option value="GTE">≥</option>
        <option value="LTE">≤</option>
        <option value="IS_EMPTY">is empty</option>
        <option value="IS_NOT_EMPTY">is not empty</option>
      </select>

      <!-- Match value -->
      <input
        v-if="needsValue(rule.operation)"
        :value="rule.value"
        class="rule-input rule-input--value"
        placeholder="match value"
        @input="updateRule(idx, 'value', ($event.target as HTMLInputElement).value)"
      />
      <div v-else class="rule-spacer" />

      <!-- Remove -->
      <button class="rule-remove" @click="removeRule(idx)" title="Remove output">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="safeValue.length === 0" class="rules-empty">
      <i class="fas fa-random"></i>
      <span>No outputs yet</span>
    </div>

    <!-- Add output -->
    <button class="add-rule-btn" @click="addRule">
      <i class="fas fa-plus"></i> Add output
    </button>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface SwitchRule {
  outputIndex: string
  outputName:  string
  operation:   string
  value:       string
}

const props = defineProps<{
  modelValue?: SwitchRule[] | null
}>()

const emit = defineEmits<{
  'update:modelValue': [SwitchRule[]]
}>()

const OUTPUT_COLORS = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4']

// Always a valid array
const safeValue = computed((): SwitchRule[] =>
  Array.isArray(props.modelValue) ? props.modelValue : []
)

function getOutputColor(idx: number) {
  return OUTPUT_COLORS[idx % OUTPUT_COLORS.length]
}

function needsValue(op: string): boolean {
  return !['IS_EMPTY', 'IS_NOT_EMPTY'].includes(op)
}

function addRule() {
  const idx = safeValue.value.length
  emit('update:modelValue', [
    ...safeValue.value,
    { outputIndex: String(idx), outputName: `Output ${idx + 1}`, operation: 'EQUALS', value: '' }
  ])
}

function removeRule(idx: number) {
  const updated = safeValue.value
    .filter((_, i) => i !== idx)
    .map((r, i) => ({ ...r, outputIndex: String(i) }))
  emit('update:modelValue', updated)
}

// Immutable update — no direct prop mutation
function updateRule(idx: number, field: keyof SwitchRule, value: string) {
  const updated = safeValue.value.map((r, i) =>
    i === idx ? { ...r, [field]: value } : r
  )
  emit('update:modelValue', updated)
}
</script>

<style scoped>
.switch-rules-editor {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.rule-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.output-badge {
  width: 20px; height: 20px; flex-shrink: 0;
  border-radius: 50%; font-size: 10px; font-weight: 800;
  color: white; display: flex; align-items: center; justify-content: center;
}

.rule-input {
  padding: 6px 9px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 12px; color: #111827; font-family: inherit;
  transition: border-color 0.15s;
}
.rule-input:focus { outline: none; border-color: #6366f1; }
.rule-input--name  { flex: 1.5; min-width: 0; }
.rule-input--value { flex: 1.5; min-width: 0; }
.rule-spacer { flex: 1.5; }

.rule-select {
  flex: 1.5; min-width: 0;
  padding: 6px 7px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 11px; font-family: inherit; color: #374151; background: white;
  cursor: pointer; transition: border-color 0.15s;
}
.rule-select:focus { outline: none; border-color: #6366f1; }

.rule-remove {
  width: 26px; height: 26px; flex-shrink: 0;
  border: 1px solid #fecaca; border-radius: 5px;
  background: transparent; color: #f87171;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 11px; transition: all 0.15s;
}
.rule-remove:hover { background: #fee2e2; color: #ef4444; }

.rules-empty {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; border-radius: 8px;
  background: #f9fafb; color: #9ca3af; font-size: 12px;
}
.rules-empty i { color: #d1d5db; }

.add-rule-btn {
  padding: 7px 12px;
  border: 1.5px dashed #d1d5db; border-radius: 7px;
  background: transparent; color: #9ca3af;
  font-size: 12px; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  font-family: inherit; transition: all 0.15s;
}
.add-rule-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
</style>

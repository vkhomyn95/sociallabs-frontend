<template>
  <div class="conditions-editor">

    <!-- AND / OR toggle — show only when 2+ conditions -->
    <div v-if="safeValue.length > 1" class="combine-bar">
      <button
        :class="['combine-btn', { active: combineOp === 'AND' }]"
        @click="$emit('update:combineOp', 'AND')"
      >AND</button>
      <button
        :class="['combine-btn', { active: combineOp === 'OR' }]"
        @click="$emit('update:combineOp', 'OR')"
      >OR</button>
      <span class="combine-hint">{{ combineOp === 'AND' ? 'All must match' : 'Any must match' }}</span>
    </div>

    <!-- Condition rows -->
    <div
      v-for="(cond, idx) in safeValue"
      :key="idx"
      class="condition-row"
    >
      <!-- Index badge -->
      <span class="cond-badge">{{ idx + 1 }}</span>

      <!-- Left value -->
      <input
        :value="cond.leftValue"
        class="cond-input cond-input--expr"
        placeholder="{{$json.field}} or value"
        @input="updateCondition(idx, 'leftValue', ($event.target as HTMLInputElement).value)"
      />

      <!-- Operation -->
      <select
        :value="cond.operation"
        class="cond-select"
        @change="updateCondition(idx, 'operation', ($event.target as HTMLSelectElement).value)"
      >
        <optgroup label="── String ──">
          <option value="EQUALS">equals</option>
          <option value="NOT_EQUALS">not equals</option>
          <option value="CONTAINS">contains</option>
          <option value="NOT_CONTAINS">not contains</option>
          <option value="STARTS_WITH">starts with</option>
          <option value="ENDS_WITH">ends with</option>
          <option value="IS_EMPTY">is empty</option>
          <option value="IS_NOT_EMPTY">is not empty</option>
          <option value="REGEX">regex match</option>
        </optgroup>
        <optgroup label="── Number ──">
          <option value="GT">greater than</option>
          <option value="LT">less than</option>
          <option value="GTE">≥ greater or equal</option>
          <option value="LTE">≤ less or equal</option>
        </optgroup>
        <optgroup label="── Boolean ──">
          <option value="IS_TRUE">is true</option>
          <option value="IS_FALSE">is false</option>
        </optgroup>
      </select>

      <!-- Right value — hidden for unary ops -->
      <input
        v-if="needsRightValue(cond.operation)"
        :value="cond.rightValue"
        class="cond-input cond-input--value"
        placeholder="value"
        @input="updateCondition(idx, 'rightValue', ($event.target as HTMLInputElement).value)"
      />
      <div v-else class="cond-spacer" />

      <!-- Remove -->
      <button class="cond-remove" @click="removeCondition(idx)" title="Remove">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Empty state -->
    <div v-if="safeValue.length === 0" class="conditions-empty">
      <i class="fas fa-filter"></i>
      <span>No conditions yet — add one below</span>
    </div>

    <!-- Add condition -->
    <button class="add-condition-btn" @click="addCondition">
      <i class="fas fa-plus"></i> Add condition
    </button>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Condition {
  leftValue:  string
  operation:  string
  rightValue: string
  type:       string
}

const props = defineProps<{
  modelValue?: Condition[] | null   // safe — may arrive as undefined
  combineOp:  string
}>()

const emit = defineEmits<{
  'update:modelValue': [Condition[]]
  'update:combineOp':  [string]
}>()

// Always a valid array — fixes "Cannot read properties of undefined (reading 'length')"
const safeValue = computed((): Condition[] =>
  Array.isArray(props.modelValue) ? props.modelValue : []
)

function addCondition() {
  emit('update:modelValue', [
    ...safeValue.value,
    { leftValue: '', operation: 'EQUALS', rightValue: '', type: 'STRING' }
  ])
}

function removeCondition(idx: number) {
  const updated = safeValue.value.filter((_, i) => i !== idx)
  emit('update:modelValue', updated)
}

function updateCondition(idx: number, field: keyof Condition, value: string) {
  const updated = safeValue.value.map((c, i) =>
    i === idx ? { ...c, [field]: value } : c
  )
  emit('update:modelValue', updated)
}

function needsRightValue(op: string): boolean {
  return !['IS_EMPTY', 'IS_NOT_EMPTY', 'IS_TRUE', 'IS_FALSE'].includes(op)
}
</script>

<style scoped>
.conditions-editor {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* AND / OR bar */
.combine-bar {
  display: flex;
  align-items: center;
  gap: 5px;
  padding-bottom: 4px;
}
.combine-btn {
  padding: 3px 12px; border-radius: 5px; border: 1px solid #d1d5db;
  background: transparent; font-size: 11px; font-weight: 700;
  cursor: pointer; color: #6b7280; font-family: inherit; transition: all 0.15s;
}
.combine-btn.active { background: #6366f1; color: white; border-color: #6366f1; }
.combine-btn:not(.active):hover { background: #f3f4f6; }
.combine-hint { font-size: 11px; color: #9ca3af; margin-left: 4px; }

/* Condition row */
.condition-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.cond-badge {
  width: 18px; height: 18px; flex-shrink: 0;
  background: #f3f4f6; border-radius: 50%;
  font-size: 10px; font-weight: 700; color: #6b7280;
  display: flex; align-items: center; justify-content: center;
}

.cond-input {
  padding: 6px 9px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 12px; color: #111827; font-family: 'JetBrains Mono', monospace;
  transition: border-color 0.15s;
}
.cond-input:focus { outline: none; border-color: #6366f1; }
.cond-input--expr  { flex: 2; min-width: 0; }
.cond-input--value { flex: 1.5; min-width: 0; }
.cond-spacer { flex: 1.5; }

.cond-select {
  flex: 1.5; min-width: 0;
  padding: 6px 7px; border: 1px solid #e5e7eb; border-radius: 6px;
  font-size: 11px; font-family: inherit; color: #374151; background: white;
  cursor: pointer; transition: border-color 0.15s;
}
.cond-select:focus { outline: none; border-color: #6366f1; }

.cond-remove {
  width: 26px; height: 26px; flex-shrink: 0;
  border: 1px solid #fecaca; border-radius: 5px;
  background: transparent; color: #f87171;
  cursor: pointer; display: flex; align-items: center; justify-content: center;
  font-size: 11px; transition: all 0.15s;
}
.cond-remove:hover { background: #fee2e2; color: #ef4444; border-color: #ef4444; }

/* Empty state */
.conditions-empty {
  display: flex; align-items: center; gap: 8px;
  padding: 12px 14px; border-radius: 8px;
  background: #f9fafb; color: #9ca3af; font-size: 12px;
}
.conditions-empty i { color: #d1d5db; }

/* Add button */
.add-condition-btn {
  padding: 7px 12px;
  border: 1.5px dashed #d1d5db; border-radius: 7px;
  background: transparent; color: #9ca3af;
  font-size: 12px; cursor: pointer;
  display: flex; align-items: center; gap: 6px;
  font-family: inherit; transition: all 0.15s;
}
.add-condition-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
</style>

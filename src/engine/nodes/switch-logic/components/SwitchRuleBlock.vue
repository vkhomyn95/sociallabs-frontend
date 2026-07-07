<script setup lang="ts">
import { SlbInput } from '@/components/ui'
import {
  type SwitchRule,
  type SwitchCondition,
  RULE_COLORS,
  emptyCondition,
  LogicOperation,
} from '../index'
import { needsRightValue, OPERATION_LABELS } from '@/engine/nodes/if-logic'

const props = defineProps<{
  rule:  SwitchRule
  index: number
}>()

const emit = defineEmits<{
  'update:rule': [SwitchRule]
  remove:        []
}>()

function updateField<K extends keyof SwitchRule>(field: K, val: SwitchRule[K]) {
  emit('update:rule', { ...props.rule, [field]: val })
}

function addCondition() {
  updateField('conditions', [...props.rule.conditions, emptyCondition()])
}

function removeCondition(idx: number) {
  updateField('conditions', props.rule.conditions.filter((_, i) => i !== idx))
}

function updateCondition(idx: number, updated: SwitchCondition) {
  updateField('conditions', props.rule.conditions.map((c, i) => i === idx ? updated : c))
}

function updateConditionField<K extends keyof SwitchCondition>(
  idx: number, field: K, val: SwitchCondition[K]
) {
  updateCondition(idx, { ...props.rule.conditions[idx], [field]: val })
}

const STRING_OPS = [
  LogicOperation.EQUALS,
  LogicOperation.NOT_EQUALS,
  LogicOperation.CONTAINS,
  LogicOperation.NOT_CONTAINS,
  LogicOperation.STARTS_WITH,
  LogicOperation.ENDS_WITH,
  LogicOperation.IS_EMPTY,
  LogicOperation.IS_NOT_EMPTY,
  LogicOperation.REGEX,
]
const NUMBER_OPS = [LogicOperation.GT, LogicOperation.LT, LogicOperation.GTE, LogicOperation.LTE]
const BOOL_OPS   = [LogicOperation.IS_TRUE, LogicOperation.IS_FALSE]
</script>

<template>
  <div class="sw-rule">
    <!-- Header -->
    <div class="sw-rule__header">
      <span class="sw-rule__index" :style="{ background: RULE_COLORS[index % RULE_COLORS.length] }">
        {{ index + 1 }}
      </span>

      <input
        :value="rule.outputName"
        class="sw-rule__name-input"
        placeholder="Output name"
        @input="updateField('outputName', ($event.target as HTMLInputElement).value)"
      />

      <div class="sw-rule__combine">
        <button
          class="sw-rule__combine-btn"
          :class="{ 'sw-rule__combine-btn--active': rule.combineOperation === 'AND' }"
          @click="updateField('combineOperation', 'AND')"
        >AND</button>
        <button
          class="sw-rule__combine-btn"
          :class="{ 'sw-rule__combine-btn--active': rule.combineOperation === 'OR' }"
          @click="updateField('combineOperation', 'OR')"
        >OR</button>
      </div>

      <button class="sw-rule__remove" title="Remove output" @click="$emit('remove')">
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Conditions -->
    <div class="sw-rule__body">
      <div
        v-for="(cond, cidx) in rule.conditions"
        :key="cidx"
        class="sw-cond"
      >
        <span class="sw-cond__badge">{{ cidx + 1 }}</span>

        <div class="sw-cond__expr">
          <SlbInput
            :model-value="cond.leftValue"
            size="sm"
            placeholder="{{$json.field}}"
            @update:model-value="updateConditionField(cidx, 'leftValue', String($event))"
          />
        </div>

        <select
          :value="cond.operation"
          class="sw-cond__select"
          @change="updateConditionField(cidx, 'operation', ($event.target as HTMLSelectElement).value as LogicOperation)"
        >
          <optgroup label="── String ──">
            <option v-for="op in STRING_OPS" :key="op" :value="op">{{ OPERATION_LABELS[op] }}</option>
          </optgroup>
          <optgroup label="── Number ──">
            <option v-for="op in NUMBER_OPS" :key="op" :value="op">{{ OPERATION_LABELS[op] }}</option>
          </optgroup>
          <optgroup label="── Boolean ──">
            <option v-for="op in BOOL_OPS" :key="op" :value="op">{{ OPERATION_LABELS[op] }}</option>
          </optgroup>
        </select>

        <div v-if="needsRightValue(cond.operation)" class="sw-cond__value">
          <SlbInput
            :model-value="cond.rightValue"
            size="sm"
            placeholder="value"
            @update:model-value="updateConditionField(cidx, 'rightValue', String($event))"
          />
        </div>
        <div v-else class="sw-cond__spacer" />

        <button class="sw-cond__remove" @click="removeCondition(cidx)">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <button class="sw-add-cond-btn" @click="addCondition">
        <i class="fas fa-plus"></i> Add condition
      </button>
    </div>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

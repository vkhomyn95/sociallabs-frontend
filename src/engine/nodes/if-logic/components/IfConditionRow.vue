<script setup lang="ts">
import { SlbInput } from '@/components/ui'
import {
  type IfCondition,
  LogicOperation,
  OPERATION_LABELS,
  needsRightValue,
} from '../index'

const emit = defineEmits<{
  'update:condition': [IfCondition]
  remove:            []
}>()

function update<K extends keyof IfCondition>(field: K, value: IfCondition[K]) {
  emit('update:condition', { ...props.condition, [field]: value } as IfCondition)
}

const STRING_OPS: LogicOperation[] = [
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

const NUMBER_OPS: LogicOperation[] = [
  LogicOperation.GT,
  LogicOperation.LT,
  LogicOperation.GTE,
  LogicOperation.LTE,
]

const BOOL_OPS: LogicOperation[] = [
  LogicOperation.IS_TRUE,
  LogicOperation.IS_FALSE,
]

// Need to re-declare props for use in update() above
const props = defineProps<{ condition: IfCondition; index: number }>()
</script>

<template>
  <div class="if-condition">
    <span class="if-condition__badge">{{ index + 1 }}</span>

    <!-- Left value -->
    <div class="if-condition__expr">
      <SlbInput
        :model-value="condition.leftValue"
        size="sm"
        placeholder="{{$json.field}} or value"
        @update:model-value="update('leftValue', String($event))"
      />
    </div>

    <!-- Operation -->
    <select
      :value="condition.operation"
      class="if-condition__select"
      @change="update('operation', ($event.target as HTMLSelectElement).value as LogicOperation)"
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

    <!-- Right value -->
    <div v-if="needsRightValue(condition.operation)" class="if-condition__value">
      <SlbInput
        :model-value="condition.rightValue"
        size="sm"
        placeholder="value"
        @update:model-value="update('rightValue', String($event))"
      />
    </div>
    <div v-else class="if-condition__spacer" />

    <!-- Remove -->
    <button class="if-condition__remove" title="Remove condition" @click="$emit('remove')">
      <i class="fas fa-times"></i>
    </button>
  </div>
</template>

<style lang="scss">
@use '../index.scss';
</style>

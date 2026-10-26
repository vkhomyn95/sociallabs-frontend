<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { SlbIcon, SlbTooltip } from '@sociallabs/frontend-components'
import { isExpression } from '@/core/expression/template'
import ExpressionInput from '../expression/ExpressionInput.vue'
import { EXPRESSION_TOGGLE_TYPES, resolveField } from './fieldRegistry'
import type { FieldEmits, FieldProps } from './fields/fieldProps'

/**
 * Label, help and value of one parameter. Fields that allow expressions but are not text switch between
 * their fixed widget and an expression input; dropping a mapped field from the input panel switches too.
 */
const props = defineProps<FieldProps>()
const emit = defineEmits<FieldEmits>()

const field = computed(() => resolveField(props.typeKey, props.property))
const canToggle = computed(() => props.property.expression && EXPRESSION_TOGGLE_TYPES.has(props.property.type))

// Expression mode is derived from the value, plus a flag for a just toggled, still empty expression.
const forced = ref(false)
const expressionMode = computed(() => canToggle.value && (forced.value || isExpression(props.modelValue)))
watch(
  () => props.modelValue,
  (value) => {
    if (isExpression(value)) forced.value = false
  },
)

function setMode(expression: boolean): void {
  if (expression === expressionMode.value) return
  if (expression) {
    forced.value = true
    const value = props.modelValue
    emit('update:modelValue', value === undefined || value === null || value === '' ? undefined : `{{ ${JSON.stringify(value)} }}`)
  } else {
    forced.value = false
    emit('update:modelValue', undefined)
  }
}

function onExpression(text: string): void {
  emit('update:modelValue', text === '' ? undefined : text)
}

const DRAG_FORMAT = 'text/plain'

function onDragOver(event: DragEvent): void {
  if (canToggle.value && !expressionMode.value && event.dataTransfer?.types.includes(DRAG_FORMAT)) event.preventDefault()
}

function onDrop(event: DragEvent): void {
  if (!canToggle.value || expressionMode.value) return
  const text = event.dataTransfer?.getData(DRAG_FORMAT) ?? ''
  if (!isExpression(text)) return
  event.preventDefault()
  emit('update:modelValue', text)
}
</script>

<template>
  <div class="wf-param" @dragover="onDragOver" @drop="onDrop">
    <div class="wf-param__label">
      <span>
        {{ property.displayName }}
        <span v-if="property.required" class="wf-param__required">*</span>
      </span>
      <SlbTooltip v-if="property.description" :content="property.description">
        <SlbIcon name="status_question" :size="13" class="wf-param__help" />
      </SlbTooltip>
      <div v-if="canToggle" class="wf-param__mode" role="group" aria-label="Value mode">
        <button type="button" :class="{ active: !expressionMode }" @click="setMode(false)">Fixed</button>
        <button type="button" :class="{ active: expressionMode }" @click="setMode(true)">Expression</button>
      </div>
    </div>

    <ExpressionInput
      v-if="expressionMode"
      :model-value="typeof modelValue === 'string' ? modelValue : ''"
      :error="issues.get(path)"
      autofocus
      @update:model-value="onExpression"
    />
    <component
      :is="field"
      v-else
      :property="property"
      :model-value="modelValue"
      :path="path"
      :issues="issues"
      :type-key="typeKey"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </div>
</template>

<style scoped lang="scss">
.wf-param {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.wf-param__label {
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: var(--slb-font-sm);
  font-weight: var(--slb-fw-medium);
  color: var(--slb-color-text);
}

.wf-param__required {
  color: var(--slb-color-error);
}

.wf-param__help {
  color: var(--slb-color-text-muted);
  cursor: help;
}

.wf-param__mode {
  display: inline-flex;
  margin-left: auto;
  overflow: hidden;
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-sm);

  button {
    padding: 1px 8px;
    font-size: 11px;
    color: var(--slb-color-text-muted);
    background: none;
    border: 0;
    cursor: pointer;

    &.active {
      color: var(--slb-color-primary);
      background: var(--slb-color-primary-light, var(--slb-color-gray-100));
    }
  }
}
</style>

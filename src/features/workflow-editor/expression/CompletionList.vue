<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { CompletionKind, type Completion } from '@/core/expression/completions'

/** Suggestions under an expression input; the input owns keyboard navigation. */
const props = defineProps<{ items: readonly Completion[]; active: number }>()
const emit = defineEmits<{ pick: [item: Completion] }>()

const KIND_LABELS: Record<CompletionKind, string> = {
  [CompletionKind.VARIABLE]: 'var',
  [CompletionKind.FIELD]: 'field',
  [CompletionKind.METHOD]: 'fn',
  [CompletionKind.NODE]: 'node',
}

const list = ref<HTMLElement>()
watch(
  () => props.active,
  async (index) => {
    await nextTick()
    list.value?.children[index]?.scrollIntoView({ block: 'nearest' })
  },
)
</script>

<template>
  <ul ref="list" class="wf-completions" role="listbox">
    <li
      v-for="(item, index) in items"
      :key="`${item.kind}:${item.label}`"
      role="option"
      :aria-selected="index === active"
      :class="{ active: index === active }"
      @mousedown.prevent="emit('pick', item)"
    >
      <span class="wf-completions__kind" :data-kind="item.kind">{{ KIND_LABELS[item.kind] }}</span>
      <span class="wf-completions__label">{{ item.label }}</span>
      <span class="wf-completions__detail">{{ item.detail }}</span>
    </li>
  </ul>
</template>

<style scoped lang="scss">
.wf-completions {
  position: absolute;
  top: calc(100% + 2px);
  right: 0;
  left: 0;
  z-index: 20;
  max-height: 220px;
  margin: 0;
  padding: 4px;
  overflow-y: auto;
  list-style: none;
  background: var(--slb-color-surface, #fff);
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
  box-shadow: var(--slb-shadow-md);

  li {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 4px 6px;
    font-size: var(--slb-font-xs);
    border-radius: var(--slb-radius-sm);
    cursor: pointer;

    &.active,
    &:hover {
      background: var(--slb-color-gray-100);
    }
  }
}

.wf-completions__kind {
  flex: none;
  width: 34px;
  font-size: 10px;
  color: var(--slb-color-text-muted);
  text-transform: uppercase;

  &[data-kind='NODE'] {
    color: var(--slb-color-primary);
  }
}

.wf-completions__label {
  font-family: var(--slb-font-mono, monospace);
  color: var(--slb-color-text);
}

.wf-completions__detail {
  margin-left: auto;
  overflow: hidden;
  color: var(--slb-color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>

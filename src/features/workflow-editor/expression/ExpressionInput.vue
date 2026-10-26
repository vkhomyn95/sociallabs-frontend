<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import type { Completion, CompletionResult } from '@/core/expression/completions'
import { caretContext, isExpression, SegmentKind, splitTemplate } from '@/core/expression/template'
import type { PreviewResult } from '../api/executionApi'
import CompletionList from './CompletionList.vue'
import { useExpressionContext } from './expressionContext'

/**
 * Template input: highlights {{ }} parts, completes variables and fields from the last run inside them,
 * closes braces as they are typed and previews the resolved value with the execution engine.
 */
const props = defineProps<{
  modelValue: string
  placeholder?: string
  error?: string
  autofocus?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const PREVIEW_DELAY_MS = 400
const PREVIEW_CHARS = 500
const MAX_SUGGESTIONS = 50
const ZERO_WIDTH_SPACE = '\u200b'

const context = useExpressionContext()
const textarea = ref<HTMLTextAreaElement>()
const highlight = ref<HTMLElement>()
const text = ref(props.modelValue)
const completion = shallowRef<CompletionResult | null>(null)
const active = ref(0)
const preview = shallowRef<PreviewResult | null>(null)
let previewTimer: ReturnType<typeof setTimeout> | undefined
let previewSeq = 0

const segments = computed(() => splitTemplate(text.value))
const expression = computed(() => isExpression(text.value))

watch(
  () => props.modelValue,
  (value) => {
    if (value === text.value) return
    text.value = value
    void nextTick(resize)
  },
)

watch(text, schedulePreview, { immediate: true })

onMounted(() => {
  resize()
  if (props.autofocus) textarea.value?.focus()
})
onBeforeUnmount(() => clearTimeout(previewTimer))

function resize(): void {
  const el = textarea.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight}px`
}

function commit(value: string): void {
  text.value = value
  emit('update:modelValue', value)
  resize()
}

function onInput(event: Event): void {
  const el = event.target as HTMLTextAreaElement
  let value = el.value
  const caret = el.selectionStart
  // Typing the second brace of "{{" closes the expression and puts the caret inside it.
  if ((event as InputEvent).data === '{' && value.slice(caret - 2, caret) === '{{' && value.slice(caret, caret + 2) !== '}}') {
    value = `${value.slice(0, caret)}  }}${value.slice(caret)}`
    el.value = value
    el.setSelectionRange(caret + 1, caret + 1)
  }
  commit(value)
  refreshCompletions()
}

function refreshCompletions(): void {
  const el = textarea.value
  if (!el || !context || el.selectionStart !== el.selectionEnd) return closeCompletions()
  const caret = caretContext(text.value, el.selectionStart)
  if (!caret) return closeCompletions()
  const result = context.completions().complete(caret.before)
  completion.value = result.items.length ? { ...result, items: result.items.slice(0, MAX_SUGGESTIONS) } : null
  active.value = 0
}

function closeCompletions(): void {
  completion.value = null
}

function pick(item: Completion): void {
  const el = textarea.value
  const current = completion.value
  if (!el || !current) return
  const caret = el.selectionStart
  const start = caret - current.replaceLength
  commit(text.value.slice(0, start) + item.insert + text.value.slice(caret))
  const next = start + item.insert.length
  void nextTick(() => {
    el.focus()
    el.setSelectionRange(next, next)
    refreshCompletions()
  })
}

function onKeydown(event: KeyboardEvent): void {
  const current = completion.value
  if (!current) return
  const count = current.items.length
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    active.value = (active.value + (event.key === 'ArrowDown' ? 1 : count - 1)) % count
  } else if (event.key === 'Enter' || event.key === 'Tab') {
    pick(current.items[active.value]!)
  } else if (event.key === 'Escape') {
    // Closing the list must not close the node view as well.
    event.stopPropagation()
    closeCompletions()
  } else {
    return
  }
  event.preventDefault()
}

function syncScroll(): void {
  if (highlight.value && textarea.value) highlight.value.scrollTop = textarea.value.scrollTop
}

function schedulePreview(): void {
  clearTimeout(previewTimer)
  if (!context || !expression.value) {
    preview.value = null
    return
  }
  const seq = ++previewSeq
  const template = text.value
  previewTimer = setTimeout(async () => {
    try {
      const result = await context.preview(template)
      if (seq === previewSeq) preview.value = result
    } catch {
      if (seq === previewSeq) preview.value = null
    }
  }, PREVIEW_DELAY_MS)
}

const previewText = computed(() => {
  const result = preview.value
  if (!result || result.error) return ''
  const value = result.value
  const shown = value === null || value === undefined ? 'null' : typeof value === 'string' ? value : JSON.stringify(value)
  return shown.length > PREVIEW_CHARS ? `${shown.slice(0, PREVIEW_CHARS)}…` : shown
})
</script>

<template>
  <div class="wf-expr" :class="{ 'wf-expr--error': error, 'wf-expr--template': expression }">
    <div class="wf-expr__box">
      <!-- The trailing zero-width space keeps the last line's height when the text ends with a line break. -->
      <div ref="highlight" class="wf-expr__layer wf-expr__highlight" aria-hidden="true"><template v-for="segment in segments" :key="segment.start"><span v-if="segment.kind === SegmentKind.EXPRESSION" class="wf-expr__expression">{{ text.slice(segment.start, segment.end) }}</span><template v-else>{{ segment.text }}</template></template>{{ ZERO_WIDTH_SPACE }}</div>
      <textarea
        ref="textarea"
        class="wf-expr__layer wf-expr__input"
        :value="text"
        :placeholder="placeholder"
        rows="1"
        spellcheck="false"
        @input="onInput"
        @keydown="onKeydown"
        @click="refreshCompletions"
        @keyup.left="refreshCompletions"
        @keyup.right="refreshCompletions"
        @blur="closeCompletions"
        @scroll="syncScroll"
      />
      <CompletionList v-if="completion" :items="completion.items" :active="active" @pick="pick" />
    </div>
    <span v-if="error" class="wf-expr__message wf-expr__message--error">{{ error }}</span>
    <span v-if="preview?.error" class="wf-expr__message wf-expr__message--error">{{ preview.error }}</span>
    <span v-else-if="preview" class="wf-expr__message">
      <span class="wf-expr__result-label">{{ context?.hasData() ? 'Result' : 'Result without input data' }}:</span>
      {{ previewText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
.wf-expr {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.wf-expr__box {
  position: relative;
  border: 1px solid var(--slb-color-border);
  border-radius: var(--slb-radius-md);
  background: var(--slb-color-surface, #fff);

  &:focus-within {
    border-color: var(--slb-color-primary);
    box-shadow: 0 0 0 3px var(--slb-color-primary-ring);
  }

  .wf-expr--error & {
    border-color: var(--slb-color-error);
  }
}

// Both layers must share every metric so the highlighted text sits exactly under the typed text.
.wf-expr__layer {
  display: block;
  width: 100%;
  min-height: 32px;
  max-height: 240px;
  margin: 0;
  padding: 6px 10px;
  font-family: var(--slb-font-mono, ui-monospace, monospace);
  font-size: var(--slb-font-xs);
  line-height: 18px;
  letter-spacing: normal;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  border: 0;
}

.wf-expr__highlight {
  position: absolute;
  inset: 0;
  overflow: hidden;
  color: var(--slb-color-text);
  pointer-events: none;
}

.wf-expr__input {
  position: relative;
  overflow-y: auto;
  color: transparent;
  caret-color: var(--slb-color-text);
  background: transparent;
  resize: none;
  outline: none;

  &::placeholder {
    color: var(--slb-color-text-muted);
  }
}

.wf-expr__expression {
  color: var(--slb-color-primary);
  background: var(--slb-color-primary-light, rgba(99, 102, 241, 0.08));
  border-radius: 3px;
}

.wf-expr__message {
  overflow: hidden;
  font-family: var(--slb-font-mono, ui-monospace, monospace);
  font-size: 11px;
  color: var(--slb-color-text-muted);
  text-overflow: ellipsis;
  white-space: nowrap;

  &--error {
    font-family: inherit;
    color: var(--slb-color-error);
    white-space: normal;
  }
}

.wf-expr__result-label {
  font-family: var(--slb-font-sans, inherit);
}
</style>

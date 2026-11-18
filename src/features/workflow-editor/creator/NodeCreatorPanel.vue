<script setup lang="ts">
import { computed, nextTick, onMounted, ref, shallowRef, watch } from 'vue'
import { SlbButton, SlbInput } from '@sociallabs/frontend-components'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { CreatorItemKind, NodeCreatorModel, type CreatorItem, type CreatorSection, type CreatorView, type NodeItem } from './creatorModel'
import { opensView } from './creatorPresentation'
import CreatorItemRow from './CreatorItemRow.vue'
import { allowsTriggers, fits, type InsertTarget } from './insertTarget'

/**
 * The node creator, like n8n's: what triggers the workflow or what happens next, categories and apps to drill into,
 * and search across every node and action. Choosing an entry adds the node; rows can also be dragged onto the canvas.
 */
const props = defineProps<{
  catalog: NodeTypeCatalog
  target: InsertTarget
  /** The workflow has a trigger, so the creator starts at what happens next. */
  hasTrigger: boolean
}>()

const emit = defineEmits<{
  choose: [item: NodeItem]
  close: []
}>()

const model = computed(
  () =>
    new NodeCreatorModel(props.catalog.all(), {
      fits: (type) => fits(type, props.target),
      allowTriggers: allowsTriggers(props.target),
      hasTrigger: props.hasTrigger,
    }),
)

/** Views opened so far; the last one is shown. */
const stack = shallowRef<CreatorView[]>([model.value.root()])
const query = ref('')
const activeIndex = ref(0)

// A new target (e.g. another plus clicked) starts over.
watch(model, (next) => {
  stack.value = [next.root()]
  query.value = ''
})

const current = computed(() => stack.value[stack.value.length - 1]!)
const searching = computed(() => query.value.trim().length > 0)
const sections = computed<readonly CreatorSection[]>(() =>
  searching.value ? [{ key: 'results', title: '', items: model.value.search(query.value) }] : current.value.sections,
)
const items = computed<CreatorItem[]>(() => sections.value.flatMap((section) => [...section.items]))

watch(items, () => (activeIndex.value = 0))

/** Index of an item in the flat list that keyboard navigation moves through. */
const indexOf = (item: CreatorItem): number => items.value.indexOf(item)

function choose(item: CreatorItem): void {
  if (item.kind === CreatorItemKind.NODE) {
    emit('choose', item)
    return
  }
  stack.value = [...stack.value, model.value.open(item)]
  query.value = ''
}

function back(): void {
  if (stack.value.length > 1) stack.value = stack.value.slice(0, -1)
}

const list = ref<HTMLElement>()

function move(step: number): void {
  const count = items.value.length
  if (!count) return
  activeIndex.value = (activeIndex.value + step + count) % count
  void nextTick(() => list.value?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' }))
}

function onKeydown(event: KeyboardEvent): void {
  const active = items.value[activeIndex.value]
  const keys: Record<string, () => void> = {
    ArrowDown: () => move(1),
    ArrowUp: () => move(-1),
    Enter: () => active && choose(active),
    ArrowRight: () => active && opensView(active) && choose(active),
    ArrowLeft: () => !searching.value && back(),
    Escape: () => emit('close'),
  }
  const action = keys[event.key]
  if (!action) return
  event.preventDefault()
  action()
}

const search = ref<InstanceType<typeof SlbInput>>()
onMounted(() => (search.value?.$el as HTMLElement | undefined)?.querySelector('input')?.focus())
</script>

<template>
  <aside class="wf-creator" role="dialog" aria-label="Add a node" @keydown="onKeydown">
    <header class="wf-creator__head">
      <SlbButton
        v-if="stack.length > 1 && !searching"
        variant="ghost"
        size="sm"
        icon-only
        icon-left="arrow_back"
        aria-label="Back"
        @click="back"
      />
      <div class="wf-creator__heading">
        <h2 class="wf-creator__title">{{ searching ? 'Search' : current.title }}</h2>
        <p v-if="!searching && current.subtitle" class="wf-creator__subtitle">{{ current.subtitle }}</p>
      </div>
      <SlbButton variant="ghost" size="sm" icon-only icon-left="action_close" aria-label="Close" @click="emit('close')" />
    </header>

    <SlbInput ref="search" v-model="query" size="sm" icon-left="action_search" placeholder="Search nodes and actions" clearable class="wf-creator__search" />

    <div ref="list" class="wf-creator__list" role="listbox">
      <section v-for="section in sections" :key="section.key" class="wf-creator__section">
        <h3 v-if="section.title" class="wf-creator__section-title">
          <span>{{ section.title }}</span>
          <span class="wf-creator__section-count">{{ section.items.length }}</span>
        </h3>
        <CreatorItemRow
          v-for="item in section.items"
          :key="item.key"
          :item="item"
          :active="indexOf(item) === activeIndex"
          @choose="choose(item)"
          @hover="activeIndex = indexOf(item)"
        />
      </section>
      <p v-if="!items.length" class="wf-creator__empty">
        {{ searching ? `Nothing matches “${query}”` : 'No nodes can be added here' }}
      </p>
    </div>
  </aside>
</template>

<style scoped lang="scss">
.wf-creator {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 380px;
  max-width: 100%;
  height: 100%;
  padding: 12px;
  background: var(--slb-color-surface, #fff);
  border-left: 1px solid var(--slb-color-border);
  //box-shadow: var(--slb-shadow-lg, 0 20px 50px rgba(0, 0, 0, 0.15));
}

.wf-creator__head {
  display: flex;
  gap: 6px;
  align-items: flex-start;
}

.wf-creator__heading {
  flex: 1;
  min-width: 0;
}

.wf-creator__title {
  margin: 4px 0 0;
  font-size: var(--slb-font-md, 15px);
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-gray-900);
}

.wf-creator__subtitle {
  margin: 2px 0 0;
  font-size: var(--slb-font-xs);
  color: var(--slb-color-gray-500);
}

.wf-creator__list {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow-y: auto;
}

.wf-creator__section {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.wf-creator__section-title {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin: 0;
  padding: 4px 10px;
  font-size: 11px;
  font-weight: var(--slb-fw-semibold);
  color: var(--slb-color-gray-500);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.wf-creator__section-count {
  font-weight: var(--slb-fw-regular, 400);
  color: var(--slb-color-gray-400);
}

.wf-creator__empty {
  margin: 24px 0;
  font-size: var(--slb-font-sm);
  color: var(--slb-color-gray-500);
  text-align: center;
}
</style>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteLocationRaw } from 'vue-router'
import { SlbBreadcrumb, SlbHeader } from '@sociallabs/frontend-components'
import type { BreadcrumbItem } from '@sociallabs/frontend-components'
import { NAV, navGroupOf } from './navigation'

interface Crumb extends BreadcrumbItem {
  to?: RouteLocationRaw
}

const route = useRoute()
const router = useRouter()

// Група меню → сторінка; група веде на свій перший розділ.
const crumbs = computed<Crumb[]>(() => {
  const section = route.meta.nav
  const group = section ? navGroupOf(section) : null
  const first = group?.sections[0]
  const items: Crumb[] = []
  if (group && first) items.push({ label: group.label, to: { name: NAV[first].route } })
  items.push({ label: route.meta.title ?? '', icon: section ? NAV[section].icon : undefined })
  return items
})

function onCrumb(_item: BreadcrumbItem, index: number): void {
  const target = crumbs.value[index]?.to
  if (target) void router.push(target)
}
</script>

<template>
  <SlbHeader class="slb-app-header">
    <template #brand>
      <SlbBreadcrumb :items="crumbs" @item-click="onCrumb" />
    </template>
  </SlbHeader>
</template>

<style lang="scss" scoped>
.slb-app-header {
  flex-shrink: 0;
}
</style>

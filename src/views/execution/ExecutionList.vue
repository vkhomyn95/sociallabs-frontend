<script setup lang="ts">
import { ref } from 'vue'
import SlbButton from '@/components/ui/button/SlbButton.vue'
import WorkflowListToolbar from '@/components/workflow/WorkflowListToolbar.vue'
import SlbTable from '@/components/ui/table/SlbTable.vue'
import type { SortState, TableColumn } from '@/components/ui/table/table.types'

interface User {
  id: number
  name: string
  email: string
  status: 'active' | 'inactive'
}

const columns: TableColumn<User>[] = [
  { key: 'id',     label: '#',      width: '60px', sortable: true },
  { key: 'name',   label: 'Name',   sortable: true },
  { key: 'email',  label: 'Email' },
  { key: 'status', label: 'Status', width: '120px', align: 'center' },
  { key: 'actions', label: '',      width: '80px',  align: 'right' },
]

// Pagination
const page     = ref(1)
const pageSize = ref(20)
const total    = ref(340)
const loading  = ref(false)
const rows     = ref<User[]>([])

// Infinite scroll
const infiniteRows    = ref<User[]>([])
const infiniteLoading = ref(false)
const hasMore         = ref(true)

async function loadMore() {
  infiniteLoading.value = true
  // fetch next page...
  infiniteLoading.value = false
}

function onSort(state: SortState) {
  console.log('sort:', state)
}

function onRowClick(row: User, index: number) {
  console.log('clicked:', row)
}

function onSelect(rows: User[]) {
  console.log('selected:', rows)
}

function editRow(row: User) {
  console.log('edit:', row)
}
</script>

<template>
  <WorkflowListToolbar @create="" />

  <div class="slb-wf-list">
    <SlbTable
      :columns="columns"
      :data="rows"
      :total="total"
      v-model:page="page"
      v-model:page-size="pageSize"
      :loading="loading"
      scroll-mode="pagination"
      selectable
      striped
      @sort="onSort"
      @row-click="onRowClick"
      @select="onSelect"
    >
      <!-- Кастомний header -->
      <template #header-status>
        <span>Status <i class="fas fa-info-circle"></i></span>
      </template>

      <!-- Кастомна клітинка -->
      <template #cell-status="{ value }">
        <span :class="`badge badge--${value}`">{{ value }}</span>
      </template>

      <template #cell-actions="{ row }">
        <SlbButton size="sm" variant="ghost" @click.stop="editRow(row)">
          Edit
        </SlbButton>
      </template>
    </SlbTable>

    <!-- ─── Infinite scroll mode ────────────────────────────────────────── -->
    <SlbTable
      :columns="columns"
      :data="infiniteRows"
      :loading="infiniteLoading"
      :has-more="hasMore"
      scroll-mode="infinite"
      @load-more="loadMore"
      @row-click="onRowClick"
    />
  </div>
</template>

<style lang="scss">
@use 'execution-list';
</style>

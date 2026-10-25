import { reactive, ref, shallowRef, watch } from 'vue'
import type { Ref } from 'vue'
import { CredentialService } from '@/stores/credential'
import type { Credential, CredentialKind, CredentialQuery, CredentialSortKey, CredentialStatus, CredentialType } from '@/stores/credential'
import { toApiError } from '@/components/credential/credential-ui'

const SEARCH_DEBOUNCE_MS = 300

export interface CredentialListFilters {
  search: string
  status: CredentialStatus | null
  type: CredentialType | null
}

/**
 * Server-paginated credential list of one kind with search, filters and sort.
 * Any filter change goes back to page 1; stale responses are dropped.
 *
 * @param kind credential kind of the current page
 * @returns list state and actions
 */
export function useCredentialList(kind: Ref<CredentialKind>) {
  const items = shallowRef<Credential[]>([])
  const total = ref(0)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const loaded = ref(false)

  const page = ref(1)
  const pageSize = ref(20)
  const sort = ref<{ key: CredentialSortKey; direction: 'asc' | 'desc' }>({ key: 'createdAt', direction: 'desc' })
  const filters = reactive<CredentialListFilters>({ search: '', status: null, type: null })

  let requestToken = 0

  async function load(): Promise<void> {
    const token = ++requestToken
    loading.value = true
    error.value = null

    const query: CredentialQuery = {
      kind: kind.value,
      types: filters.type ? [filters.type] : undefined,
      status: filters.status ?? undefined,
      search: filters.search,
      page: page.value,
      pageSize: pageSize.value,
      sort: sort.value.key,
      direction: sort.value.direction,
    }

    try {
      const result = await CredentialService.search(query)
      if (token !== requestToken) return
      // Deleting the last row of the last page leaves it empty — step back.
      if (!result.items.length && page.value > 1 && result.total > 0) {
        page.value = Math.ceil(result.total / pageSize.value)
        return
      }
      items.value = result.items
      total.value = result.total
      loaded.value = true
    } catch (e) {
      if (token === requestToken) error.value = toApiError(e, 'Failed to load credentials').message
    } finally {
      if (token === requestToken) loading.value = false
    }
  }

  /** Reload from page 1 (filters changed). */
  function reset(): void {
    if (page.value !== 1) page.value = 1
    else void load()
  }

  /**
   * Replace a row in place after edit/test, without reloading the page.
   *
   * @param credential updated credential
   */
  function replace(credential: Credential): void {
    items.value = items.value.map((item) => (item.id === credential.id ? credential : item))
  }

  watch([page, pageSize, sort], () => void load(), { deep: true })
  watch(() => [filters.status, filters.type], reset)

  let searchTimer: ReturnType<typeof setTimeout> | undefined
  watch(() => filters.search, () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(reset, SEARCH_DEBOUNCE_MS)
  })

  // A new section starts clean.
  watch(kind, () => {
    filters.search = ''
    filters.status = null
    filters.type = null
    loaded.value = false
    reset()
  }, { immediate: true })

  return { items, total, loading, loaded, error, page, pageSize, sort, filters, load, replace }
}

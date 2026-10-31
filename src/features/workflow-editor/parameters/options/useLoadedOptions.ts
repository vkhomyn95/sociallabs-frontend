import { computed, ref, shallowRef, watch, type Ref } from 'vue'
import type { PropertyOption } from '@/core/node-types/descriptor'
import { schemaPath, type FieldPath } from '@/core/node-types/parameters'
import { editorApi } from '../../api/editorApi'
import { useOptionsContext } from './optionsContext'

/** State of a field's loaded choices. */
export interface LoadedOptions {
  options: Readonly<Ref<readonly PropertyOption[]>>
  loading: Readonly<Ref<boolean>>
  /** Why the choices could not be loaded, null when they could. */
  error: Readonly<Ref<string | null>>
  /** Whether a credential is selected; without one there is nothing to load. */
  hasCredential: Readonly<Ref<boolean>>
  reload(): void
}

/**
 * Loads the choices of a field from the server, again whenever the node's credential changes. Answers that arrive
 * after a newer request started are dropped, so switching credentials quickly never shows the old key's choices.
 */
export function useLoadedOptions(typeKey: () => string, path: () => FieldPath): LoadedOptions {
  const context = useOptionsContext()
  const options = shallowRef<readonly PropertyOption[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const credentialId = computed(() => context?.credentialId() ?? null)
  let request = 0

  async function load(refresh: boolean): Promise<void> {
    const current = ++request
    if (!context || credentialId.value === null) {
      options.value = []
      loading.value = false
      error.value = null
      return
    }
    loading.value = true
    error.value = null
    try {
      const query = { typeKey: typeKey(), property: schemaPath(path()), credentialId: credentialId.value, parameters: context.parameters() }
      const loaded = await context.loader.load(query, refresh)
      if (current === request) options.value = loaded
    } catch (failure) {
      if (current === request) {
        options.value = []
        error.value = editorApi.errorMessage(failure)
      }
    } finally {
      if (current === request) loading.value = false
    }
  }

  watch(credentialId, () => void load(false), { immediate: true })

  return {
    options,
    loading,
    error,
    hasCredential: computed(() => credentialId.value !== null),
    reload: () => void load(true),
  }
}

import { computed, ref, shallowRef, watch, type ComputedRef, type Ref } from 'vue'
import { isExpression } from '@/core/expression/template'
import { WhatsAppBotService } from '@/components/credential/whatsapp-bot/whatsappBot.service'
import type {
  TemplateLanguageStructure,
  WhatsAppTemplateStructureResponse,
} from '@/components/credential/whatsapp-bot/whatsappBot.types'
import { editorApi } from '../../../api/editorApi'
import { useOptionsContext } from '../../options/optionsContext'
import { SendTemplateField, TemplateLookup, languageOf } from './templateValues'

/** An answer is reused this long, so the template's fields ask Meta once, yet show an edited template soon. */
const FRESH_MS = 60_000

type CachedStructure = { at: number; answer: Promise<WhatsAppTemplateStructureResponse> }

/** Shared by the fields of one node (header, body, buttons), which all follow the same template. */
const cache = new Map<string, CachedStructure>()

/** Forgets every loaded template; for tests. */
export function clearTemplateStructures(): void {
  cache.clear()
}

function fetchStructure(credentialId: number, name: string, refresh: boolean): Promise<WhatsAppTemplateStructureResponse> {
  const key = `${credentialId}|${name}`
  const cached = cache.get(key)
  if (cached && !refresh && Date.now() - cached.at < FRESH_MS) return cached.answer
  const answer = WhatsAppBotService.templateStructure(credentialId, name)
  cache.set(key, { at: Date.now(), answer })
  answer.catch(() => cache.delete(key))
  return answer
}

export interface TemplateStructure {
  lookup: ComputedRef<TemplateLookup>
  /** The language the node sends, when the lookup is READY. */
  language: ComputedRef<TemplateLanguageStructure | undefined>
  /** The template's languages, when it was found. */
  languages: ComputedRef<readonly string[]>
  /** Why it could not be loaded. */
  error: Readonly<Ref<string | null>>
  reload(): void
}

/**
 * The structure of the template chosen in the open "Send a template" node, loaded again when the credential or the
 * template changes. Answers that arrive after a newer request started are dropped.
 */
export function useTemplateStructure(): TemplateStructure {
  const context = useOptionsContext()
  const answer = shallowRef<WhatsAppTemplateStructureResponse | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  let request = 0

  const credentialId = computed(() => context?.credentialId() ?? null)
  const parameter = (field: SendTemplateField): unknown => context?.parameters()[field]
  const name = computed(() => {
    const value = parameter(SendTemplateField.TEMPLATE)
    return typeof value === 'string' ? value.trim() : ''
  })
  const dynamic = computed(() => isExpression(name.value))

  async function load(refresh: boolean): Promise<void> {
    const current = ++request
    answer.value = null
    error.value = null
    if (credentialId.value === null || name.value === '' || dynamic.value) {
      loading.value = false
      return
    }
    loading.value = true
    try {
      const loaded = await fetchStructure(credentialId.value, name.value, refresh)
      if (current !== request) return
      answer.value = loaded
      error.value = loaded.error ?? null
    } catch (failure) {
      if (current === request) error.value = editorApi.errorMessage(failure)
    } finally {
      if (current === request) loading.value = false
    }
  }

  watch([credentialId, name], () => void load(false), { immediate: true })

  const language = computed(() => {
    if (!answer.value) return undefined
    return languageOf(answer.value, parameter(SendTemplateField.LANGUAGE))
  })

  const lookup = computed(() => {
    if (credentialId.value === null) return TemplateLookup.NO_CREDENTIAL
    if (name.value === '') return TemplateLookup.NO_TEMPLATE
    if (dynamic.value) return TemplateLookup.DYNAMIC_TEMPLATE
    if (loading.value) return TemplateLookup.LOADING
    if (error.value !== null || !answer.value) return TemplateLookup.FAILED
    if (answer.value.languages.length === 0) return TemplateLookup.NOT_FOUND
    if (!language.value) return TemplateLookup.NO_LANGUAGE
    return TemplateLookup.READY
  })

  return {
    lookup,
    language: computed(() => (lookup.value === TemplateLookup.READY ? language.value : undefined)),
    languages: computed(() => answer.value?.languages.map((entry) => entry.language) ?? []),
    error,
    reload: () => void load(true),
  }
}

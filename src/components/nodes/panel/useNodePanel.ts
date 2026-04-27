import { computed, ref } from 'vue'
import { PanelStep } from './types'
import { NodeType } from '@/stores/node/types.ts'

export function useNodePanel() {
  // ─── State ───────────────────────────────────────────────────────────────
  const currentStep    = ref<PanelStep>(PanelStep.TYPE)
  const selectedType   = ref<NodeType | null>(null)
  const selectedCategory = ref<string | null>(null)
  const searchQuery    = ref('')

  // ─── Navigation history ──────────────────────────────────────────────────
  const history = ref<PanelStep[]>([])

  // ─── Computed ─────────────────────────────────────────────────────────────
  const canGoBack = computed(() => history.value.length > 0)

  // ─── Actions ──────────────────────────────────────────────────────────────
  function pushStep(step: PanelStep) {
    history.value.push(currentStep.value)
    currentStep.value = step
  }

  function goBack() {
    const prev = history.value.pop()
    if (prev !== undefined) {
      currentStep.value = prev

      // Clean state when going back
      if (prev === PanelStep.TYPE) {
        selectedType.value     = null
        selectedCategory.value = null
        searchQuery.value      = ''
      } else if (prev === PanelStep.CATEGORY) {
        selectedCategory.value = null
        searchQuery.value      = ''
      }
    }
  }

  function navigateTo(step: PanelStep) {
    // Reset history to that step
    const stepOrder = [PanelStep.TYPE, PanelStep.CATEGORY, PanelStep.NODES]
    const targetIdx = stepOrder.indexOf(step)

    // Trim history and reset state
    history.value = stepOrder.slice(0, targetIdx)
    currentStep.value = step

    if (step === PanelStep.TYPE) {
      selectedType.value     = null
      selectedCategory.value = null
      searchQuery.value      = ''
    } else if (step === PanelStep.CATEGORY) {
      selectedCategory.value = null
      searchQuery.value      = ''
    }
  }

  function selectType(type: NodeType) {
    selectedType.value = type
    pushStep(PanelStep.CATEGORY)
  }

  function selectCategory(category: string) {
    selectedCategory.value = category
    pushStep(PanelStep.NODES)
  }

  return {
    // State
    currentStep,
    selectedType,
    selectedCategory,
    searchQuery,
    // Computed
    canGoBack,
    // Actions
    goBack,
    navigateTo,
    selectType,
    selectCategory,
  }
}

import { computed, ref } from 'vue'

export interface SelectOption {
  label: string
  value: string | number
  disabled?: boolean
  icon?: string
}

export interface UseSelectProps {
  modelValue: string | number | null
  options: SelectOption[]
  disabled?: boolean
  searchable?: boolean
}

export function useSelect(props: UseSelectProps) {
  const isOpen = ref(false)
  const search = ref('')

  const selectedOption = computed((): SelectOption | null => {
    return props.options.find((o) => o.value === props.modelValue) ?? null
  })

  const filteredOptions = computed((): SelectOption[] => {
    if (!props.searchable || !search.value.trim()) return props.options
    const q = search.value.toLowerCase()
    return props.options.filter((o) => o.label.toLowerCase().includes(q))
  })

  const open = (): void => {
    if (props.disabled) return
    isOpen.value = true
    search.value = ''
  }

  const close = (): void => {
    isOpen.value = false
    search.value = ''
  }

  const toggle = (): void => {
    isOpen.value ? close() : open()
  }

  const selectOption = (option: SelectOption): void => {
    if (option.disabled) return
    close()
  }

  return {
    isOpen,
    search,
    selectedOption,
    filteredOptions,
    open,
    close,
    toggle,
    selectOption,
  }
}

import { computed } from 'vue'

export interface TabItem {
  key: string
  label: string
  icon?: string
  badge?: string | number
  disabled?: boolean
}

export type TabVariant = 'line' | 'pill' | 'card' | 'auth'

export interface UseTabProps {
  modelValue: string
  tabs: TabItem[]
}

export function useTab(props: UseTabProps) {
  const activeKey = computed(() => props.modelValue)

  const isActive = (key: string): boolean => activeKey.value === key

  const select = (
    tab: TabItem,
    emit: (event: 'update:modelValue', key: string) => void
  ): void => {
    if (tab.disabled || tab.key === activeKey.value) return
    emit('update:modelValue', tab.key)
  }

  return { activeKey, isActive, select }
}

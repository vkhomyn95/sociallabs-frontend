import { computed, ref } from 'vue'
import { PERIOD_SCALE, Period, isPeriod } from './statistics.mock'

/** Обраний період для сторінок статистики + масштабування тижневих моків під нього. */
export function usePeriod() {
  const period = ref<Period>(Period.WEEK)

  const model = computed<string>({
    get: () => period.value,
    set: (key) => {
      if (isPeriod(key)) period.value = key
    },
  })

  const scale = (n: number): number => Math.round(n * PERIOD_SCALE[period.value])

  return { period, model, scale }
}

import { computed, reactive, watch } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { FormFieldType } from '@/stores/credential/types'
import type { FormFieldSchema, FormValues } from '@/stores/credential/types'

export interface CredentialForm {
  values: FormValues
  errors: Record<string, string>
  /** Fields whose visibility condition is met. */
  visibleFields: ComputedRef<FormFieldSchema[]>
  /** True when every visible required field has a value. */
  isComplete: ComputedRef<boolean>
  /** Edit mode: secrets are optional and blank means "keep the stored value". */
  editing: boolean
  isRequired: (field: FormFieldSchema) => boolean
  /** Values of visible fields ready for the API. */
  payload: () => FormValues
  setValue: (key: string, value: FormValues[string]) => void
  setErrors: (errors: Record<string, string>) => void
}

/**
 * Form state for a backend-provided field schema: defaults, conditional visibility,
 * required checks and payload building.
 *
 * @param fields  schema, may change (e.g. when another type is picked)
 * @param editing true when editing an existing credential
 * @returns form state
 */
export function useCredentialForm(fields: Readonly<Ref<FormFieldSchema[]>>, editing = false): CredentialForm {
  const values = reactive<FormValues>({})
  const errors = reactive<Record<string, string>>({})

  const initial = (field: FormFieldSchema): FormValues[string] => {
    if (field.type === FormFieldType.BOOLEAN) return field.defaultValue === 'true'
    if (editing && field.secret) return ''
    return field.defaultValue ?? ''
  }

  watch(
    fields,
    (schema) => {
      Object.keys(values).forEach((key) => delete values[key])
      Object.keys(errors).forEach((key) => delete errors[key])
      schema.forEach((field) => (values[field.key] = initial(field)))
    },
    { immediate: true },
  )

  const isVisible = (field: FormFieldSchema): boolean =>
    !field.visibleWhen || String(values[field.visibleWhen.field] ?? '') === field.visibleWhen.value

  const isRequired = (field: FormFieldSchema): boolean => field.required && !(editing && field.secret)

  const isEmpty = (value: FormValues[string] | undefined): boolean =>
    value === null || value === undefined || (typeof value === 'string' && !value.trim())

  const visibleFields = computed(() => fields.value.filter(isVisible))

  const isComplete = computed(() =>
    visibleFields.value.every((field) => !isRequired(field) || !isEmpty(values[field.key])),
  )

  const payload = (): FormValues => {
    const result: FormValues = {}
    for (const field of visibleFields.value) {
      const value = values[field.key]
      if (value === undefined || isEmpty(value)) {
        // Omitted secrets keep their stored value; other blanks clear the field.
        if (!field.secret) result[field.key] = null
        continue
      }
      result[field.key] = field.type === FormFieldType.NUMBER ? Number(value) : value
    }
    return result
  }

  const setValue = (key: string, value: FormValues[string]): void => {
    values[key] = value
    delete errors[key]
  }

  const setErrors = (next: Record<string, string>): void => {
    Object.keys(errors).forEach((key) => delete errors[key])
    Object.assign(errors, next)
  }

  return { values, errors, visibleFields, isComplete, editing, isRequired, payload, setValue, setErrors }
}

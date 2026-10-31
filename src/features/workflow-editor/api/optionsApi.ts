import api from '@/core/services/api'
import type { PropertyOption } from '@/core/node-types/descriptor'
import { OptionsLoader, type OptionsQuery } from '@/core/node-types/OptionsLoader'

/** `POST /node-types/{key}/options`: choices of a field that loads them, e.g. the models of an API key. */
export const optionsApi = {
  async load({ typeKey, property, credentialId, parameters }: OptionsQuery): Promise<PropertyOption[]> {
    const url = `/node-types/${encodeURIComponent(typeKey)}/options`
    return (await api.post<PropertyOption[]>(url, { property, credentialId, parameters })).data
  },
}

/** One loader for the whole editor, so choices survive closing and reopening a node. */
export const optionsLoader = new OptionsLoader(optionsApi.load)

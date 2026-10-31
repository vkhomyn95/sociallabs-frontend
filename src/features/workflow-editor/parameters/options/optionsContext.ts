import { inject, provide, type InjectionKey } from 'vue'
import type { OptionsLoader } from '@/core/node-types/OptionsLoader'

/** What fields that load their choices need from the open node: its credential and its form values. */
export interface OptionsContext {
  loader: OptionsLoader
  credentialId(): number | null
  parameters(): Readonly<Record<string, unknown>>
}

const OPTIONS_CONTEXT: InjectionKey<OptionsContext> = Symbol('options-context')

export const provideOptionsContext = (context: OptionsContext): void => provide(OPTIONS_CONTEXT, context)

/** @returns the context of the enclosing node details view, null outside one */
export const useOptionsContext = (): OptionsContext | null => inject(OPTIONS_CONTEXT, null)

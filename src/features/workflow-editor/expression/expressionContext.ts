import { inject, provide, type InjectionKey } from 'vue'
import type { ExpressionCompletions } from '@/core/expression/completions'
import type { PreviewResult } from '../api/executionApi'

/** What expression fields of the open node can use: completions from its run data and server previews. */
export interface ExpressionContext {
  completions(): ExpressionCompletions
  preview(template: string): Promise<PreviewResult>
  /** Whether the node has input data from a previous run, so previews are meaningful. */
  hasData(): boolean
}

const EXPRESSION_CONTEXT: InjectionKey<ExpressionContext> = Symbol('expression-context')

export const provideExpressionContext = (context: ExpressionContext): void => provide(EXPRESSION_CONTEXT, context)

/** @returns the context of the enclosing node details view, null outside one */
export const useExpressionContext = (): ExpressionContext | null => inject(EXPRESSION_CONTEXT, null)

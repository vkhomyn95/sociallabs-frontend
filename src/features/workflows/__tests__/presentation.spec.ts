import { describe, expect, it } from 'vitest'
import { NodeKind } from '@/core/node-types/descriptor'
import { nodeType } from '@/core/node-types/__tests__/descriptorFixtures'
import type { WorkflowNodeDto } from '@/core/workflow/dto'
import { formatUpdated, publishStateOf, PublishState, triggersOf, workflowLook } from '../presentation'

const node = (nodeId: string, typeName: string): WorkflowNodeDto => ({
  nodeId,
  name: nodeId,
  typeName,
  typeVersion: 1,
  position: null,
  parameters: null,
  credentialId: null,
  disabled: null,
  notes: null,
  settings: null,
})

describe('workflow card presentation', () => {
  const types = [
    nodeType({ name: 'telegram.botTrigger', kind: NodeKind.TRIGGER }),
    nodeType({ name: 'core.if', kind: NodeKind.ACTION }),
  ]

  it('finds the triggers by node type and takes the look of the first', () => {
    const triggers = triggersOf({ nodes: [node('if', 'core.if'), node('bot', 'telegram.botTrigger')] }, types)
    expect(triggers.map((t) => t.nodeId)).toEqual(['bot'])
    expect(workflowLook(triggers).icon).toBe('brand_telegram')
    expect(workflowLook([]).icon).toBe('dev_nodes')
  })

  it('tells drafts, published workflows and unpublished changes apart', () => {
    expect(publishStateOf({ activeVersionId: null, hasUnpublishedChanges: true })).toBe(PublishState.DRAFT_ONLY)
    expect(publishStateOf({ activeVersionId: 3, hasUnpublishedChanges: false })).toBe(PublishState.PUBLISHED)
    expect(publishStateOf({ activeVersionId: 3, hasUnpublishedChanges: true })).toBe(PublishState.UNPUBLISHED_CHANGES)
  })

  it('says when a workflow was updated in days and weeks', () => {
    const now = new Date('2026-10-27T12:00:00Z').getTime()
    expect(formatUpdated(null, now)).toBe('Never')
    expect(formatUpdated('2026-10-27T08:00:00Z', now)).toBe('Today')
    expect(formatUpdated('2026-10-26T08:00:00Z', now)).toBe('Yesterday')
    expect(formatUpdated('2026-10-18T12:00:00Z', now)).toBe('1 week ago')
    expect(formatUpdated('2026-10-10T12:00:00Z', now)).toBe('2 weeks ago')
  })
})

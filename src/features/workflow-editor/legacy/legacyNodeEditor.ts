import type { WorkflowEditorSession } from '@/core/editor/WorkflowEditorSession'
import type { NodeTypeCatalog } from '@/core/node-types/NodeTypeCatalog'
import { NodeKind } from '@/core/node-types/descriptor'
import { typeKeyOf, type NodeId, type NodeModel } from '@/core/workflow/model'
import { useModal } from '@/composables/useModal'
import { ModalType } from '@/stores/modal/types'
import { NodeDiscriminator, NodeType, type NodeInstance } from '@/stores/node/types'

/**
 * Legacy node type of each node type name (backend NodeDiscriminator). The legacy node editor panels are
 * keyed by it; this bridge goes away when the nodes get schema-driven forms (migration steps 11–13).
 */
const LEGACY_DISCRIMINATORS: Readonly<Record<string, NodeDiscriminator>> = {
  'telegram.botAction': NodeDiscriminator.TELEGRAM_BOT_ACTION,
  'telegram.botTrigger': NodeDiscriminator.TELEGRAM_BOT_TRIGGER,
  'telegram.accountAction': NodeDiscriminator.TELEGRAM_CLIENT_ACTION,
  'telegram.accountTrigger': NodeDiscriminator.TELEGRAM_CLIENT_TRIGGER,
  'viber.botAction': NodeDiscriminator.VIBER_BOT_ACTION,
  'viber.botTrigger': NodeDiscriminator.VIBER_BOT_TRIGGER,
  'viber.accountAction': NodeDiscriminator.VIBER_CLIENT_ACTION,
  'viber.accountTrigger': NodeDiscriminator.VIBER_CLIENT_TRIGGER,
  'whatsapp.botAction': NodeDiscriminator.WHATSAPP_BOT_ACTION,
  'whatsapp.botTrigger': NodeDiscriminator.WHATSAPP_BOT_TRIGGER,
  'whatsapp.accountAction': NodeDiscriminator.WHATSAPP_CLIENT_ACTION,
  'whatsapp.accountTrigger': NodeDiscriminator.WHATSAPP_CLIENT_TRIGGER,
  'messenger.botAction': NodeDiscriminator.MESSENGER_BOT_ACTION,
  'messenger.botTrigger': NodeDiscriminator.MESSENGER_BOT_TRIGGER,
  'instagram.botAction': NodeDiscriminator.INSTAGRAM_BOT_ACTION,
  'instagram.botTrigger': NodeDiscriminator.INSTAGRAM_BOT_TRIGGER,
  'core.if': NodeDiscriminator.IF_LOGIC,
  'core.switch': NodeDiscriminator.SWITCH_LOGIC,
  'http.request': NodeDiscriminator.HTTP_REQUEST,
  'ai.agent': NodeDiscriminator.AI_AGENT,
}

function toNodeInstance(node: NodeModel, catalog: NodeTypeCatalog): NodeInstance {
  return {
    nodeId: node.id,
    name: node.name,
    type: catalog.get(typeKeyOf(node))?.kind === NodeKind.TRIGGER ? NodeType.TRIGGER : NodeType.ACTION,
    // Nodes without a legacy panel (webhook, schedule) open with the name and credential sections only.
    discriminator: LEGACY_DISCRIMINATORS[node.type] ?? (node.type as NodeDiscriminator),
    position: { ...node.position },
    parameters: structuredClone(node.parameters) as Record<string, unknown>,
    credentialId: node.credentialId ?? undefined,
    disabled: node.disabled,
    notes: node.notes ?? undefined,
  }
}

/**
 * Edit a node in the legacy node editor dialog; saving applies the changed fields as one undo step.
 *
 * @returns whether the dialog was saved
 */
export async function openLegacyNodeEditor(session: WorkflowEditorSession, catalog: NodeTypeCatalog, nodeId: NodeId): Promise<boolean> {
  const doc = session.document
  const node = doc.requireNode(nodeId)
  const upstream = doc.incoming(nodeId).map((connection) => toNodeInstance(doc.requireNode(connection.source), catalog))
  const { default: NodeEditorModal } = await import('@/engine/NodeEditorModal.vue')
  let edited: NodeInstance
  try {
    edited = await useModal().open<NodeInstance>(
      NodeEditorModal,
      { node: toNodeInstance(node, catalog), upstream },
      { size: ModalType.max, closeOnBackdrop: false },
    )
  } catch {
    return false
  }
  if (!doc.node(nodeId)) return false
  session.patch(nodeId, {
    name: edited.name?.trim() || node.name,
    parameters: edited.parameters ?? {},
    credentialId: edited.credentialId ?? null,
    disabled: edited.disabled ?? false,
    notes: edited.notes ?? null,
  })
  return true
}

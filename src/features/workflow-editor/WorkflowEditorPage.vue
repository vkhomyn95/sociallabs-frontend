<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { SlbAlert } from '@sociallabs/frontend-components'
import { editableView } from '@/core/editor/WorkflowView'
import WorkflowHeader from '@/features/workflow-shell/WorkflowHeader.vue'
import { WorkflowTab } from '@/features/workflow-shell/workflowTabs'
import EditorCanvas from './canvas/EditorCanvas.vue'
import NodeDetailsView from './ndv/NodeDetailsView.vue'
import NodeCreatorPanel from './creator/NodeCreatorPanel.vue'
import type { NodeItem } from './creator/creatorModel'
import { useNodeCreator } from './creator/useNodeCreator'
import EditorActions from './toolbar/EditorActions.vue'
import { useEditorShortcuts } from './composables/useEditorShortcuts'
import { useWorkflowEditor } from './composables/useWorkflowEditor'

const route = useRoute()
const workflowId = computed(() => Number(route.params.id))

const editor = useWorkflowEditor(workflowId.value)
const canvas = ref<InstanceType<typeof EditorCanvas>>()
const view = computed(() => (editor.session.value ? editableView(editor.session.value) : null))

useEditorShortcuts({
  undo: () => editor.undo(),
  redo: () => editor.redo(),
  save: () => void editor.save(),
  deleteSelection: () => canvas.value?.deleteSelection(),
  addNode: () => canvas.value?.requestFreeInsert(),
})

const creator = useNodeCreator(() => view.value, () => editor.catalog.value)

/** Add the chosen node and open it, like n8n, so its parameters can be set right away. */
function onCreatorChoose(item: NodeItem): void {
  const node = creator.insert(item)
  if (node) editor.openNode(node.id)
}
</script>

<template>
  <div class="wf-editor">
    <SlbAlert v-if="editor.loadError.value" variant="error" class="wf-editor__error">
      Could not open workflow {{ workflowId }}: {{ editor.loadError.value }}
    </SlbAlert>

    <template v-else-if="view && editor.catalog.value">
      <WorkflowHeader
        :workflow-id="workflowId"
        :name="editor.toolbar.name"
        :active="editor.toolbar.active"
        :tab="WorkflowTab.EDITOR"
        renamable
        @rename="editor.rename"
      >
        <template #actions>
          <EditorActions
            :state="editor.toolbar"
            @undo="editor.undo"
            @redo="editor.redo"
            @publish="editor.publish"
            @toggle-active="editor.toggleActive"
            @execute="editor.execute"
            @reload="editor.reload"
          />
        </template>
      </WorkflowHeader>
      <div class="wf-editor__body">
        <EditorCanvas
          ref="canvas"
          :view="view"
          :catalog="editor.catalog.value"
          :tracker="editor.runs.tracker"
          @open="editor.openNode"
          @rejected="editor.onRejected"
          @create="creator.open"
          @dropped="creator.close"
          @pane-click="creator.close"
        />
        <NodeCreatorPanel
          v-if="creator.target.value"
          class="wf-editor__creator"
          :catalog="editor.catalog.value"
          :target="creator.target.value"
          :has-trigger="creator.hasTrigger.value"
          @choose="onCreatorChoose"
          @close="creator.close"
        />
      </div>
      <NodeDetailsView
        v-if="editor.openNodeId.value"
        :key="editor.openNodeId.value"
        :view="view"
        :catalog="editor.catalog.value"
        :node-id="editor.openNodeId.value"
        :run-data="editor.runs.runData.value"
        :tracker="editor.runs.tracker"
        :executing="editor.toolbar.executing"
        @close="editor.closeNode"
        @execute="editor.execute"
      />
    </template>

    <div v-else class="wf-editor__loading">Loading workflow…</div>
  </div>
</template>

<style scoped lang="scss">
.wf-editor {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: var(--slb-color-gray-50);
}

.wf-editor__body {
  position: relative;
  display: flex;
  flex: 1;
  min-height: 0;
}

// Over the canvas on the right, like n8n's node creator; the canvas stays usable to its left.
.wf-editor__creator {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
}

.wf-editor__error {
  margin: 24px;
}

.wf-editor__loading {
  display: grid;
  flex: 1;
  place-items: center;
  color: var(--slb-color-text-muted);
}
</style>

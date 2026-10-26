<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SlbAlert, SlbToastProvider } from '@sociallabs/frontend-components'
import type { NodeTypeDescriptor } from '@/core/node-types/descriptor'
import EditorCanvas from './canvas/EditorCanvas.vue'
import NodePalette from './palette/NodePalette.vue'
import EditorToolbar from './toolbar/EditorToolbar.vue'
import { useEditorShortcuts } from './composables/useEditorShortcuts'
import { useWorkflowEditor } from './composables/useWorkflowEditor'

const route = useRoute()
const router = useRouter()
const workflowId = computed(() => Number(route.params.id))

const editor = useWorkflowEditor(workflowId.value)
const canvas = ref<InstanceType<typeof EditorCanvas>>()

useEditorShortcuts({
  undo: () => editor.undo(),
  redo: () => editor.redo(),
  save: () => void editor.save(),
  deleteSelection: () => canvas.value?.deleteSelection(),
})

function addFromPalette(type: NodeTypeDescriptor): void {
  const centre = canvas.value?.viewportCentre()
  if (centre) editor.addNode(type, centre)
}
</script>

<template>
  <div class="wf-editor">
    <SlbToastProvider />
    <SlbAlert v-if="editor.loadError.value" variant="error" class="wf-editor__error">
      Could not open workflow {{ workflowId }}: {{ editor.loadError.value }}
    </SlbAlert>

    <template v-else-if="editor.session.value && editor.catalog.value">
      <EditorToolbar
        :state="editor.toolbar"
        @back="router.push('/workflows')"
        @rename="editor.rename"
        @undo="editor.undo"
        @redo="editor.redo"
        @publish="editor.publish"
        @toggle-active="editor.toggleActive"
        @execute="editor.execute"
        @reload="editor.reload"
      />
      <div class="wf-editor__body">
        <NodePalette :catalog="editor.catalog.value" @add="addFromPalette" />
        <EditorCanvas
          ref="canvas"
          :session="editor.session.value"
          :catalog="editor.catalog.value"
          @open="editor.openNode"
          @rejected="editor.onRejected"
        />
      </div>
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
  display: flex;
  flex: 1;
  min-height: 0;
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

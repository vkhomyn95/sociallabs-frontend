<template>
  <div
    class="custom-node"
    :class="{
      disabled: data.disabled,
      selected: isSelected,
      trigger: isTrigger
    }"
    @mouseenter="showActions = true"
    @mouseleave="showActions = false"
  >
    <!-- Top controls (hover) -->
    <Transition name="fade">
      <div v-if="showActions" class="top-controls">
        <button class="control-btn" @click.stop="onPlayClick" title="Execute">
          <i class="fas fa-play"></i>
        </button>
        <button class="control-btn" @click.stop="onTestClick" title="Test">
          <i class="fas fa-flask"></i>
        </button>
        <button class="control-btn danger-btn" @click.stop="$emit('delete', data.id)" title="Delete">
          <i class="fas fa-trash"></i>
        </button>
        <button class="control-btn" @click.stop="$emit('configure', data.id)" title="More">
          <i class="fas fa-ellipsis-h"></i>
        </button>
      </div>
    </Transition>

    <!-- Input Handle з вертикальною лінією -->
    <Handle
      v-if="!isTrigger"
      type="target"
      position="left"
      :id="'main'"
      class="node-handle node-handle-input"
    />

    <!-- Node Content -->
    <div class="node-content">
      <!-- Icon Circle -->
      <div class="node-icon-wrapper" :style="{ background: nodeColor }">
        <i :class="data.icon || 'fas fa-cube'" class="node-icon"></i>
      </div>

      <!-- Node Name -->
      <div class="node-name">{{ data.name }}</div>

      <!-- Warning indicator for disabled -->
      <div v-if="data.disabled" class="node-warning-badge">
        <i class="fas fa-exclamation-triangle"></i>
      </div>
    </div>

    <!-- Output Handle -->
    <Handle
      type="source"
      position="right"
      :id="'main'"
      class="node-handle node-handle-output"
    />

    <!-- Subtitle внизу ноди -->
    <div v-if="nodeSubtitle" class="node-subtitle">{{ nodeSubtitle }}</div>

    <!-- Bottom action buttons (hover) -->
    <Transition name="fade">
      <div v-if="showActions && !isTrigger" class="bottom-actions">
        <button class="add-btn" title="Add node below">
          <i class="fas fa-plus"></i>
        </button>
      </div>
    </Transition>

    <!-- Execution indicator -->
    <div v-if="data.executing" class="node-execution-indicator">
      <div class="spinner"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Handle } from '@vue-flow/core';
import { useNodeStore } from '@/stores/node'

interface Props {
  data: {
    id: string;
    name: string;
    nodeType: string;
    disabled: boolean;
    executing?: boolean;
    icon?: string;
    color?: string;
    parameters?: {
      event?: string;
      operation?: string;
      resource?: string;
      [key: string]: any;
    };
  };
}

const props = defineProps<Props>();
const emit = defineEmits(['delete', 'configure', 'execute']);

const nodeStore = useNodeStore();

const showActions = ref(false);

const isSelected = computed(() => {
  return false;
});

const isTrigger = computed(() => {
  return props.data.nodeType === 'TRIGGER';
});

const nodeColor = computed(() => {
  if (props.data.disabled) {
    return '#9ca3af';
  }
  return props.data.color || '#6366f1';
});

const nodeSubtitle = computed(() => {
  if (isTrigger.value) {
    // Для trigger показуємо "trigger: {event}"
    const event = props.data.parameters?.triggerOn || null;

    if (!event) return ''

    return `trigger: ${event}`;
  } else {
    // Для action показуємо "{operation}: {resource}"
    const operation = props.data.parameters?.operation || '';
    const resource = props.data.parameters?.resource || '';

    if (!operation || !resource) return '';

    return `${operation}: ${resource}`;
  }
});

const onPlayClick = () => {
  emit('execute', props.data.id);
};

const onTestClick = () => {
    nodeStore.TEST_NODE_DEFINITION(props.data);
}
</script>

<style scoped>
.custom-node {
  position: relative;
  background: white;
  border: 1px solid #b1b1b7;
  border-radius: 8px;
  transition: all 0.2s;
  cursor: pointer;
  width: 140px;
  min-height: 64px;
  padding: 12px;
}

.custom-node:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-color: #d1d5db;
}

.custom-node.selected {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
}

.custom-node.disabled {
  opacity: 0.6;
}

.custom-node.trigger {
  border-left-color: #3b82f6;
  border-left-width: 3px;
}

/* Top controls */
.top-controls {
  position: absolute;
  top: -32px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  background: white;
  padding: 4px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.control-btn {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
  font-size: 12px;
}

.control-btn:hover {
  background: #f3f4f6;
  color: #374151;
}

.control-btn.danger-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* Bottom actions */
.bottom-actions {
  position: absolute;
  bottom: -32px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
}

.add-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
  font-size: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.add-btn:hover {
  background: #f3f4f6;
  color: #374151;
  transform: scale(1.1);
}

/* Node content */
.node-content {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.node-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.node-icon {
  font-size: 20px;
  color: white;
}

.node-name {
  font-size: 13px;
  font-weight: 600;
  color: #111827;
  line-height: 1.3;
  flex: 1;
}

.node-subtitle {
  position: absolute;
  bottom: -22px;
  left: 0;
  right: 0;
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 0 4px;
}

.node-warning-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 16px;
  height: 16px;
  background: #f59e0b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white;
}

.node-warning-badge i {
  font-size: 8px;
  color: white;
}

/* Handles - invisible by default */
.node-handle {
  width: 10px;
  height: 10px;
  border: 1px solid #b1b1b7;
  background-color: #b1b1b7;
}

.node-handle-output {
  //border-color: #10b981;
  //background-color: #10b981;
}

.node-handle-input {
  border: none;
  background: #b1b1b7;
  height: 20px;
  width: 5px;
  border-radius: 4px;
}

/* Execution indicator */
.node-execution-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 16px;
  height: 16px;
}

.spinner {
  width: 100%;
  height: 100%;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

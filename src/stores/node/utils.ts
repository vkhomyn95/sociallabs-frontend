// stores/node/utils.ts

import type { Node, NodeDefinition, NodeParameter, DisplayCondition, NodeInstance } from './types';

/**
 * Отримати дефолтні значення параметрів з definition
 */
export function getDefaultParameters(definition: NodeDefinition): Record<string, any> {
  const defaults: Record<string, any> = {};

  for (const param of definition.parameters) {
    if (param.default !== undefined) {
      defaults[param.name] = param.default;
    }
  }

  return defaults;
}

/**
 * Перевірити чи параметр має бути відображений
 */
export function shouldShowParameter(
  param: NodeParameter,
  currentParameters: Record<string, any>
): boolean {
  if (!param.displayCondition) return true;

  const { field, values } = param.displayCondition;
  const currentValue = String(currentParameters[field] || '');

  return values.includes(currentValue);
}

/**
 * Отримати видимі параметри
 */
export function getVisibleParameters(
  definition: NodeDefinition | null,
  currentParameters: Record<string, any>
): NodeParameter[] {
  if (!definition) return [];

  return definition.parameters.filter(param =>
    shouldShowParameter(param, currentParameters)
  );
}

/**
 * Валідувати параметри ноди
 */
export function validateNodeParameters(
  definition: NodeDefinition,
  parameters: Record<string, any>
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  const visibleParams = getVisibleParameters(definition, parameters);

  for (const param of visibleParams) {
    if (param.required) {
      const value = parameters[param.name];

      if (value === undefined || value === null || value === '') {
        errors.push(`${param.displayName} is required`);
      }
    }

    // Валідація числових полів
    if (param.type === 'number' && parameters[param.name] !== undefined) {
      const value = Number(parameters[param.name]);

      if (isNaN(value)) {
        errors.push(`${param.displayName} must be a number`);
      }

      if (param.min !== undefined && value < param.min) {
        errors.push(`${param.displayName} must be at least ${param.min}`);
      }

      if (param.max !== undefined && value > param.max) {
        errors.push(`${param.displayName} must be at most ${param.max}`);
      }
    }

    // Валідація JSON
    if (param.type === 'json' && parameters[param.name]) {
      try {
        JSON.parse(parameters[param.name]);
      } catch {
        errors.push(`${param.displayName} must be valid JSON`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Створити нову інстанцію ноди з дефолтними значеннями
 */
export function createNodeInstance(
  definition: NodeDefinition,
  position: { x: number; y: number }
): Partial<Node> {
  return {
    nodeId: generateNodeId(),
    type: definition.type,
    discriminator: definition.executor,
    name: definition.name,
    positionX: position.x,
    positionY: position.y,
    parameters: getDefaultParameters(definition),
    disabled: false
  };
}

/**
 * Згенерувати унікальний ID для ноди
 */
export function generateNodeId(): string {
  return self.crypto.randomUUID();
}

/**
 * Клонувати ноду
 */
export function cloneNode(node: NodeInstance, offset: { x: number; y: number }): NodeInstance {
  return {
    ...node,
    id: generateNodeId(),
    nodeId: generateNodeId(),
    name: `${node.name} (Copy)`,
    positionX: node.positionX + offset.x,
    positionY: node.positionY + offset.y
  };
}

/**
 * Перевірити чи нода має credentials
 */
export function hasCredentials(node: NodeInstance): boolean {
  return node.credentialId !== undefined && node.credentialId !== null;
}

/**
 * Отримати summary ноди для відображення
 */
export function getNodeSummary(node: NodeInstance, definition: NodeDefinition | null): string {
  if (!definition) return 'No description';

  // Спробувати створити короткий опис на основі параметрів
  const keyParams = definition.parameters
    .filter(p => p.required && node.parameters[p.name])
    .slice(0, 2)
    .map(p => {
      const value = node.parameters[p.name];
      return typeof value === 'string' && value.length > 30
        ? `${value.substring(0, 30)}...`
        : value;
    });

  return keyParams.length > 0
    ? keyParams.join(', ')
    : definition.description;
}

/**
 * Форматувати назву категорії
 */
export function formatCategoryName(category: string): string {
  return category
    .split('_')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Перевірити чи параметр має options
 */
export function hasOptions(param: NodeParameter): boolean {
  return param.type === 'options' &&
    param.options !== undefined &&
    param.options.length > 0;
}

/**
 * Отримати label для option value
 */
export function getOptionLabel(param: NodeParameter, value: string): string {
  if (!hasOptions(param)) return value;

  const option = param.options!.find(opt => opt.value === value);
  return option?.name || value;
}

/**
 * Перевірити чи нода є trigger
 */
export function isTriggerNode(node: NodeInstance): boolean {
  return node.type === 'TRIGGER';
}

/**
 * Перевірити чи нода є action
 */
export function isActionNode(node: NodeInstance): boolean {
  return node.type === 'ACTION';
}

/**
 * Перевірити чи нода є transform
 */
export function isTransformNode(node: NodeInstance): boolean {
  return node.type === 'TRANSFORM';
}

/**
 * Отримати кількість required параметрів
 */
export function getRequiredParametersCount(definition: NodeDefinition): number {
  return definition.parameters.filter(p => p.required).length;
}

/**
 * Отримати кількість заповнених required параметрів
 */
export function getFilledRequiredParametersCount(
  definition: NodeDefinition,
  parameters: Record<string, any>
): number {
  return definition.parameters
    .filter(p => p.required)
    .filter(p => {
      const value = parameters[p.name];
      return value !== undefined && value !== null && value !== '';
    })
    .length;
}

/**
 * Перевірити чи нода налаштована повністю
 */
export function isNodeConfigured(
  definition: NodeDefinition,
  node: NodeInstance
): boolean {
  const visibleParams = getVisibleParameters(definition, node.parameters);
  const requiredParams = visibleParams.filter(p => p.required);

  for (const param of requiredParams) {
    const value = node.parameters[param.name];
    if (value === undefined || value === null || value === '') {
      return false;
    }
  }

  // Перевірити credentials якщо потрібні
  if (definition.requiresCredentials && !hasCredentials(node)) {
    return false;
  }

  return true;
}

/**
 * Отримати відсоток налаштування ноди
 */
export function getConfigurationProgress(
  definition: NodeDefinition,
  node: NodeInstance
): number {
  const visibleParams = getVisibleParameters(definition, node.parameters);
  const requiredParams = visibleParams.filter(p => p.required);

  if (requiredParams.length === 0) {
    return definition.requiresCredentials && !hasCredentials(node) ? 0 : 100;
  }

  const filled = requiredParams.filter(p => {
    const value = node.parameters[p.name];
    return value !== undefined && value !== null && value !== '';
  }).length;

  let progress = (filled / requiredParams.length) * 100;

  // Врахувати credentials
  if (definition.requiresCredentials) {
    progress = progress * 0.9;
    if (hasCredentials(node)) {
      progress += 10;
    }
  }

  return Math.round(progress);
}

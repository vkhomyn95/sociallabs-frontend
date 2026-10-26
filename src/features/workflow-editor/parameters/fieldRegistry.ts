import type { Component } from 'vue'
import { PropertyType, type PropertyDescriptor } from '@/core/node-types/descriptor'
import BooleanField from './fields/BooleanField.vue'
import CollectionField from './fields/CollectionField.vue'
import FixedCollectionField from './fields/FixedCollectionField.vue'
import JsonField from './fields/JsonField.vue'
import MultiOptionsField from './fields/MultiOptionsField.vue'
import NumberField from './fields/NumberField.vue'
import OptionsField from './fields/OptionsField.vue'
import StringField from './fields/StringField.vue'
import { overrideFor } from './overrides'

let registry: Readonly<Record<PropertyType, Component>> | null = null

/**
 * The field component of each property type. Built on first use: collection fields render nested forms,
 * which import this module back.
 */
function fieldRegistry(): Readonly<Record<PropertyType, Component>> {
  return (registry ??= {
    [PropertyType.AUTO]: StringField,
    [PropertyType.STRING]: StringField,
    [PropertyType.NUMBER]: NumberField,
    [PropertyType.BOOLEAN]: BooleanField,
    [PropertyType.OPTIONS]: OptionsField,
    [PropertyType.MULTI_OPTIONS]: MultiOptionsField,
    [PropertyType.COLLECTION]: CollectionField,
    [PropertyType.FIXED_COLLECTION]: FixedCollectionField,
    [PropertyType.JSON]: JsonField,
  })
}

/** @returns the override of the node type for this field, or the generic field of its property type */
export function resolveField(typeKey: string, property: PropertyDescriptor): Component {
  return overrideFor(typeKey, property.name) ?? fieldRegistry()[property.type]
}

/** Property types that switch to an expression input as a whole; strings take templates directly. */
export const EXPRESSION_TOGGLE_TYPES: ReadonlySet<PropertyType> = new Set([
  PropertyType.NUMBER,
  PropertyType.BOOLEAN,
  PropertyType.OPTIONS,
  PropertyType.MULTI_OPTIONS,
  PropertyType.JSON,
])

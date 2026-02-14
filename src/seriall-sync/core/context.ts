import type { ContextPalette, ContextPaletteLike } from '../../seriall/core/context.ts'

/**
 * Adapter for serialization/deserialization.
 *
 * An Adapter handles conversion between complex objects and their pure data representations,
 * enabling custom serialization logic for specific object types.
 *
 * @template T - The original object type to be serialized/deserialized
 * @template P - The pure data type representing the serialized form
 */
export type AdapterSync<T, P> = {
  /**
   * Converts an object to its pure data representation.
   *
   * This method should:
   * 1. Extract essential data from the complex object
   * 2. Return a serializable representation (primitive values, arrays, plain objects, or other builtin-types who has adapters)
   * 3. Preserve necessary information for accurate reconstruction
   *
   * @param obj - The source object to be serialized
   * @returns serializable data representation of the object
   */
  serialize(obj: T): P
  /**
   * Reconstructs an object
   *
   * This method should:
   * 1. Interpret the serialized data
   * 2. Recreate an equivalent object instance
   * 3. Maintain type-specific characteristics and behavior
   *
   * @param pure - The same as what `serialize` returned
   * @returns Reconstructed object instance
   */
  deserialize(pure: P): T
}

/**
 * Registry of type adapters organized by constructor name.
 *
 * Structure:
 * - Key: Constructor name (e.g., 'Date', 'Map')
 * - Value: Configured Adapter instance for handling that type
 */
export type ContextAdaptersSync = Map<string, AdapterSync<unknown, unknown>>

/**
 * Contextual configuration for serialization/deserialization operations.
 */
export type ContextSync = {
  /**
   * Value registry for global/shared references
   */
  palette: ContextPalette
  /**
   * Map of type-specific serialization handlers
   */
  adapters: ContextAdaptersSync
}

/**
 * Simplified object-based format for defining adapters.
 */
export type ContextAdaptersSyncLike = Record<string, AdapterSync<unknown, unknown>>

/**
 * Configuration template for creating serialization contexts.
 * Provides optional simplified formats that will be internally converted
 * to their strongly-typed counterparts.
 */
export type ContextSyncLike = {
  /**
   * Optional value registry in object format
   */
  palette?: ContextPaletteLike
  /**
   * Optional adapter configuration in object format
   */
  adapters?: ContextAdaptersSyncLike
}

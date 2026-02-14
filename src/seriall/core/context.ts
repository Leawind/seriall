import type { BiMap } from '@leawind/bimap'

/**
 * Bidirectional registry for global/shared object references.
 *
 * Acts as a two-way mapping between:
 * - Unique string keys (for serialization)
 * - Object instances (runtime references)
 *
 * Enables consistent reference tracking during serialization/deserialization
 * operations across multiple object graphs.
 */
export type ContextPalette = BiMap<string, unknown>

/**
 * Simplified object-based format for defining context palettes.
 *
 * @see ContextPalette
 */
export type ContextPaletteLike = Record<string, unknown>

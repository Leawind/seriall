import * as toml from '@std/toml'
import * as yaml from '@std/yaml'
import { BiMap } from '@leawind/bimap'

import { BUILTIN_PALETTE } from '../seriall/builtin/palette.ts'
import type { Pure } from '../seriall/core/pure.ts'
import type { StringifyFormatOptions } from '../seriall/utils.ts'

import { BUILTIN_ADAPTERS_SYNC } from './builtin/adapters.ts'
import { obj2puresSync, pures2objSync } from './core/core.ts'
import type { ContextSync, ContextSyncLike } from './core/context.ts'

function buildSeriallContextSync(options: ContextSyncLike): ContextSync {
  return {
    palette: BiMap.from(options.palette || {}),
    adapters: new Map(Object.entries(options.adapters || {})),
  }
}

/**
 * Options for serialization/deserialization operations
 *
 * @property palette - Optional value registry in object format, will be add to the head of contexts array
 * @property adapters - Optional adapter configuration in object format, will be add to the head of contexts array
 * @property contexts - Array of additional context configurations
 * @property builtinPalette - Whether to include built-in global references (default: true)
 * @property builtinAdapters - Whether to include built-in type adapters (default: true)
 */
export type SeriallOptionsSync = ContextSyncLike & {
  contexts?: ContextSyncLike[]
  builtinPalette?: boolean
  builtinAdapters?: boolean
}

function parseSeriallOptionsSync(options: SeriallOptionsSync): ContextSync[] {
  const contexts: ContextSync[] = []

  if (options.palette || options.adapters) {
    contexts.push(buildSeriallContextSync({
      palette: options.palette,
      adapters: options.adapters,
    }))
  }

  if (options.contexts) {
    for (const ctx of options.contexts) {
      contexts.push(buildSeriallContextSync(ctx))
    }
  }

  options.builtinPalette = options.builtinPalette !== false
  options.builtinAdapters = options.builtinAdapters !== false
  if (options.builtinPalette || options.builtinAdapters) {
    contexts.push({
      palette: options.builtinPalette ? BUILTIN_PALETTE : new BiMap(),
      adapters: options.builtinAdapters ? BUILTIN_ADAPTERS_SYNC : new Map(),
    })
  }

  return contexts
}

/**
 * Serialize an object to an array of SeriallPure objects.
 * @param obj - The object to purify.
 * @param options - Options
 * @returns An array of SeriallPure objects.
 *
 * @see parsePures
 * @see Pure
 */
export function purifySync<T>(obj: T, options: SeriallOptionsSync = {}): Pure[] {
  const contexts = parseSeriallOptionsSync(options)
  return obj2puresSync(obj, contexts)
}

/**
 * Serialize an object to a JSON string.
 * @param obj - The object to stringify.
 * @param options - Options
 * @returns A string representing the object in the specified format.
 */
export function stringifySync<T>(
  obj: T,
  options: SeriallOptionsSync & Partial<StringifyFormatOptions> = {},
): string {
  const contexts = parseSeriallOptionsSync(options)
  const pures = obj2puresSync(obj, contexts)
  switch (options.format) {
    case 'toml':
      return toml.stringify(pures as unknown as Record<string, unknown>)
    case 'yaml':
      return yaml.stringify(pures as unknown as Record<string, unknown>)
    case 'json':
    default:
      return JSON.stringify(pures)
  }
}

/**
 * Deserialize an object from an array of Pures
 *
 * @param pures - Array of Pures to deserialize
 * @param options - Configuration options for deserialization
 * @returns The reconstructed object instance
 *
 * @see purifySync
 * @see Pure
 */
export function parseSync<T>(str: Pure[], options?: SeriallOptionsSync): T
/**
 * Deserialize a JSON string to an object.
 * @param str - The JSON string to parse.
 * @param options - Options
 * @returns The parsed object.
 */
export function parseSync<T>(
  str: string,
  options?: SeriallOptionsSync & Partial<StringifyFormatOptions>,
): T
export function parseSync<T>(
  arg0: Pure[] | string,
  options: SeriallOptionsSync & Partial<StringifyFormatOptions> = {},
): T {
  const contexts = parseSeriallOptionsSync(options)
  if (typeof arg0 === 'string') {
    let pures: Pure[]
    switch (options.format) {
      case 'toml':
        pures = toml.parse(arg0) as unknown as Pure[]
        break
      case 'yaml':
        pures = yaml.parse(arg0) as unknown as Pure[]
        break
      case 'json':
      default:
        pures = JSON.parse(arg0) as unknown as Pure[]
        break
    }
    return pures2objSync(pures, contexts)
  } else {
    return pures2objSync(arg0, contexts)
  }
}

/**
 * Deep clone an object.
 *
 * @param obj - The object to clone.
 * @param options - Options
 * @returns A clone of the object.
 *
 * @see purifySync
 * @see parsePures
 */
export function deepCloneSync<T>(obj: T, options: SeriallOptionsSync = {}): T {
  const contexts = parseSeriallOptionsSync(options)
  return pures2objSync(obj2puresSync(obj, contexts), contexts)
}

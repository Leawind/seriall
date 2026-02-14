import * as toml from '@std/toml'
import * as yaml from '@std/yaml'
import { BiMap } from '@leawind/bimap'

import { BUILTIN_PALETTE } from '../seriall/builtin/palette.ts'
import type { Pure } from '../seriall/core/pure.ts'
import type { StringifyFormatOptions } from '../seriall/utils.ts'

import { obj2puresAsync, pures2objAsync } from './core/core.ts'
import type { ContextAsync, ContextAsyncLike } from './core/context.ts'
import { BUILTIN_ADAPTERS_ASYNC } from './builtin/adapters.ts'

function buildSeriallContextAsync(options: ContextAsyncLike): ContextAsync {
  return {
    palette: BiMap.from(options.palette || {}),
    adapters: new Map(Object.entries(options.adapters || {})),
  }
}

export type SeriallOptionsAsync = ContextAsyncLike & {
  contexts?: ContextAsyncLike[]
  builtinPalette?: boolean
  builtinAdapters?: boolean
}

function parseSeriallOptionsAsync(options: SeriallOptionsAsync): ContextAsync[] {
  const contexts: ContextAsync[] = []

  if (options.palette || options.adapters) {
    contexts.push(buildSeriallContextAsync({
      palette: options.palette,
      adapters: options.adapters,
    }))
  }

  if (options.contexts) {
    for (const ctx of options.contexts) {
      contexts.push(buildSeriallContextAsync(ctx))
    }
  }

  options.builtinPalette = options.builtinPalette !== false
  options.builtinAdapters = options.builtinAdapters !== false
  if (options.builtinPalette || options.builtinAdapters) {
    contexts.push({
      palette: options.builtinPalette ? BUILTIN_PALETTE : new BiMap(),
      adapters: options.builtinAdapters ? BUILTIN_ADAPTERS_ASYNC : new Map(),
    })
  }

  return contexts
}

export async function purifyAsync<T>(
  obj: T,
  options: SeriallOptionsAsync = {},
): Promise<Pure[]> {
  const contexts = parseSeriallOptionsAsync(options)
  return await obj2puresAsync(obj, contexts)
}

export async function stringifyAsync<T>(
  obj: T,
  options: SeriallOptionsAsync & Partial<StringifyFormatOptions> = {},
): Promise<string> {
  const contexts = parseSeriallOptionsAsync(options)
  const pures = await obj2puresAsync(obj, contexts)
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

export async function parseAsync<T>(
  str: Pure[],
  options?: SeriallOptionsAsync,
): Promise<T>
export async function parseAsync<T>(
  str: string,
  options?: SeriallOptionsAsync & Partial<StringifyFormatOptions>,
): Promise<T>
export async function parseAsync<T>(
  arg0: Pure[] | string,
  options: SeriallOptionsAsync & Partial<StringifyFormatOptions> = {},
): Promise<T> {
  const contexts = parseSeriallOptionsAsync(options)
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
    return await pures2objAsync(pures, contexts)
  } else {
    return await pures2objAsync(arg0, contexts)
  }
}

export async function deepCloneAsync<T>(
  obj: T,
  options: SeriallOptionsAsync = {},
): Promise<T> {
  const contexts = parseSeriallOptionsAsync(options)
  return await pures2objAsync(
    await obj2puresAsync(obj, contexts),
    contexts,
  )
}

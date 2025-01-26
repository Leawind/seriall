import type { Context, ContextLike } from '@/seriall/core/context.ts';
import type { Pure } from '@/seriall/core/pure.ts';
import { obj2pures, pures2obj } from '@/seriall/core.ts';
import * as toml from '@std/toml';
import * as yaml from '@std/yaml';
import { BUILTIN_ADAPTERS } from '@/seriall/builtin/adapters.ts';
import { BUILTIN_PALETTE } from '@/seriall/builtin/palette.ts';
import { BiMap } from '@/seriall/utils/bimap.ts';

function buildSeriallContext(options: ContextLike): Context {
	return {
		palette: BiMap.fromRecord(options.palette || {}),
		adapters: new Map(Object.entries(options.adapters || {})),
	};
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
export type SeriallOptions = ContextLike & {
	contexts?: ContextLike[];
	builtinPalette?: boolean;
	builtinAdapters?: boolean;
};

function parseSeriallOptions(options: SeriallOptions): Context[] {
	const contexts: Context[] = [];

	if (options.palette || options.adapters) {
		contexts.push(buildSeriallContext({
			palette: options.palette,
			adapters: options.adapters,
		}));
	}

	if (options.contexts) {
		for (const ctx of options.contexts) {
			contexts.push(buildSeriallContext(ctx));
		}
	}

	options.builtinPalette = options.builtinPalette !== false;
	options.builtinAdapters = options.builtinAdapters !== false;
	if (options.builtinPalette || options.builtinAdapters) {
		contexts.push({
			palette: options.builtinPalette ? BUILTIN_PALETTE : new BiMap(),
			adapters: options.builtinAdapters ? BUILTIN_ADAPTERS : new Map(),
		});
	}

	return contexts;
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
export function purify<T>(obj: T, options: SeriallOptions = {}): Pure[] {
	const contexts = parseSeriallOptions(options);
	return obj2pures(obj, contexts);
}

export type StringifyFormatOptions = { format: 'json' | 'toml' | 'yaml' };

/**
 * Serialize an object to a JSON string.
 * @param obj - The object to stringify.
 * @param options - Options
 * @returns A string representing the object in the specified format.
 */
export function stringify<T>(
	obj: T,
	options: SeriallOptions & Partial<StringifyFormatOptions> = {},
): string {
	const contexts = parseSeriallOptions(options);
	const pures = obj2pures(obj, contexts);
	switch (options.format) {
		case 'toml':
			return toml.stringify(pures as unknown as Record<string, unknown>);
		case 'yaml':
			return yaml.stringify(pures as unknown as Record<string, unknown>);
		case 'json':
		default:
			return JSON.stringify(pures);
	}
}

/**
 * Deserialize an object from an array of Pures
 *
 * @param pures - Array of Pures to deserialize
 * @param options - Configuration options for deserialization
 * @returns The reconstructed object instance
 *
 * @see purify
 * @see Pure
 */
export function parse<T>(str: Pure[], options?: SeriallOptions): T;

/**
 * Deserialize a JSON string to an object.
 * @param str - The JSON string to parse.
 * @param options - Options
 * @returns The parsed object.
 */
export function parse<T>(
	str: string,
	options?: SeriallOptions & Partial<StringifyFormatOptions>,
): T;
export function parse<T>(
	arg0: Pure[] | string,
	options: SeriallOptions & Partial<StringifyFormatOptions> = {},
): T {
	const contexts = parseSeriallOptions(options);
	if (typeof arg0 === 'string') {
		let pures: Pure[];
		switch (options.format) {
			case 'toml':
				pures = toml.parse(arg0) as unknown as Pure[];
				break;
			case 'yaml':
				pures = yaml.parse(arg0) as unknown as Pure[];
				break;
			case 'json':
			default:
				pures = JSON.parse(arg0) as unknown as Pure[];
				break;
		}
		return pures2obj(pures, contexts);
	} else {
		return pures2obj(arg0, contexts);
	}
}

/**
 * Deep clone an object.
 *
 * @param obj - The object to clone.
 * @param options - Options
 * @returns A clone of the object.
 *
 * @see purify
 * @see parsePures
 */
export function deepClone<T>(obj: T, options: SeriallOptions = {}): T {
	const contexts = parseSeriallOptions(options);
	return pures2obj(
		obj2pures(obj, contexts),
		contexts,
	);
}

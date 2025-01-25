import type { Context, ContextLike } from '@/seriall/core/context.ts';
import type { Pure } from '@/seriall/core/pure.ts';
import { obj2pures, pures2obj } from '@/seriall/core.ts';
import { BUILTIN_ADAPTERS } from '@/seriall/builtin/adapters.ts';
import { BUILTIN_PALETTE } from '@/seriall/builtin/palette.ts';
import { BiMap } from '@/seriall/utils/bimap.ts';

function buildSeriallContext(options: ContextLike): Context {
	return {
		palette: BiMap.fromRecord(options.palette || {}),
		adapters: new Map(Object.entries(options.adapters || {})),
	};
}

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
 * @param options - Options for the serialization process.
 * @returns An array of SeriallPure objects.
 */
export function purify<T>(obj: T, options: SeriallOptions = {}): Pure[] {
	const contexts = parseSeriallOptions(options);
	return obj2pures(obj, contexts);
}

export function parsePures<T>(
	pures: Pure[],
	options: SeriallOptions = {},
): T {
	const contexts = parseSeriallOptions(options);
	return pures2obj(pures, contexts);
}

/**
 * Serialize an object to a JSON string.
 * @param obj - The object to stringify.
 * @param options - Options for the serialization process.
 * @returns A JSON string representing the object.
 */
export function stringify<T>(obj: T, options: SeriallOptions = {}): string {
	const contexts = parseSeriallOptions(options);
	const pures = obj2pures(obj, contexts);
	return JSON.stringify(pures);
}

/**
 * Deserialize a JSON string to an object.
 * @param str - The JSON string to parse.
 * @param options - Options for the deserialization process.
 * @returns The parsed object.
 */
export function parse<T>(str: string, options: SeriallOptions = {}): T {
	const contexts = parseSeriallOptions(options);
	const pures = JSON.parse(str);
	return pures2obj(pures, contexts);
}

/**
 * Deep clone an object.
 *
 * @param obj - The object to clone.
 * @param options - Options for the cloning process.
 * @returns A clone of the object.
 */
export function deepClone<T>(obj: T, options: SeriallOptions = {}): T {
	const contexts = parseSeriallOptions(options);
	return pures2obj(
		obj2pures(obj, contexts),
		contexts,
	);
}

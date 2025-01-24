import type { SeriallContext } from '@/seriall/core/context.ts';
import type { SeriallPure } from '@/seriall/core/pure.ts';

import {
	deserializeRecursively,
	serializeRecursively,
} from '@/seriall/core/serialization.ts';

/**
 * Converts an object to an array of `SeriallPure` objects.
 *
 * @param obj - The object to convert.
 * @param contexts - The serialization contexts.
 * @returns An array of `SeriallPure` objects.
 */
export function obj2pures<T>(
	obj: T,
	contexts: SeriallContext[],
): SeriallPure[] {
	const pures: SeriallPure[] = [];
	serializeRecursively(obj, pures, contexts);
	return pures;
}

/**
 * Converts an array of `SeriallPure` objects to an object.
 *
 * @param pures - The array of `SeriallPure` objects.
 * @param contexts - The serialization contexts.
 * @returns The resulting object.
 */
export function pures2obj<T>(
	pures: SeriallPure[],
	contexts: SeriallContext[],
): T {
	return deserializeRecursively(pures.length - 1, pures, contexts);
}

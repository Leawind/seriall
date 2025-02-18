import type { ContextSync } from '@/seriall-sync/core/context.ts';
import type { Pure } from '@/seriall/core/pure.ts';
import { deserializeRecursivelySync, serializeRecursivelySync } from '@/seriall-sync/core/serialization.ts';

/**
 * Converts an object to an array of `SeriallPure` objects.
 *
 * @param obj - The object to convert.
 * @param contexts - The serialization contexts.
 * @returns An array of `SeriallPure` objects.
 */
export function obj2puresSync<T>(
	obj: T,
	contexts: ContextSync[],
): Pure[] {
	const pures: Pure[] = [];
	serializeRecursivelySync(obj, pures, contexts);
	return pures;
}

/**
 * Converts an array of `SeriallPure` objects to an object.
 *
 * @param pures - The array of `SeriallPure` objects.
 * @param contexts - The serialization contexts.
 * @returns The resulting object.
 */
export function pures2objSync<T>(
	pures: Pure[],
	contexts: ContextSync[],
): T {
	return deserializeRecursivelySync(0, pures, contexts);
}

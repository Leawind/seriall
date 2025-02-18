import type { Pure } from '@/seriall/core/pure.ts';

import type { ContextAsync } from '@/seriall-async/core/context.ts';
import { deserializeRecursivelyAsync, serializeRecursivelyAsync } from '@/seriall-async/core/serialization.ts';

export async function obj2puresAsync<T>(
	obj: T,
	contexts: ContextAsync[],
): Promise<Pure[]> {
	const pures: Pure[] = [];
	await serializeRecursivelyAsync(obj, pures, contexts);
	return pures;
}

export async function pures2objAsync<T>(
	pures: Pure[],
	contexts: ContextAsync[],
): Promise<T> {
	return await deserializeRecursivelyAsync(0, pures, contexts);
}

import type { ContextPalette, ContextPaletteLike } from '../../seriall/core/context.ts';

/**
 * @see AdapterSync
 */
export type AdapterAsync<T, P> = {
	serialize(obj: T): Promise<P> | P;
	deserialize(pure: P): Promise<T> | T;
};

/**
 * @see ContextAdaptersSync
 */
export type ContextAdaptersAsync = Map<string, AdapterAsync<unknown, unknown>>;

/**
 * @see ContextSync
 */
export type ContextAsync = {
	palette: ContextPalette;
	adapters: ContextAdaptersAsync;
};

/**
 * @see ContextAdaptersSyncLike
 */
export type ContextAdaptersAsyncLike = Record<string, AdapterAsync<unknown, unknown>>;

/**
 * @see ContextSyncLike
 */
export type ContextAsyncLike = {
	palette?: ContextPaletteLike;
	adapters?: ContextAdaptersAsyncLike;
};

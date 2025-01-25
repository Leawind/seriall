import type { BiMap } from '@/seriall/utils/bimap.ts';

export type ContextValues = BiMap<string, unknown>;

export type Adapter<T, P> = {
	serialize(obj: T): P;
	deserialize(pure: P): T;
};
export type ContextAdapters = Map<string, Adapter<unknown, unknown>>;

export type Context = {
	values: ContextValues;
	adapters: ContextAdapters;
};

export type ContextValuesLike = Record<string, unknown>;

export type ContextAdaptersLike = Record<string, Adapter<unknown, unknown>>;

export type ContextLike = {
	values?: ContextValuesLike;
	adapters?: ContextAdaptersLike;
};

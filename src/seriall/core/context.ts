import type { BiMap } from '@/seriall/utils/bimap.ts';

export type ContextPalette = BiMap<string, unknown>;

export type Adapter<T, P> = {
	serialize(obj: T): P;
	deserialize(pure: P): T;
};
export type ContextAdapters = Map<string, Adapter<unknown, unknown>>;

export type Context = {
	palette: ContextPalette;
	adapters: ContextAdapters;
};

export type ContextPaletteLike = Record<string, unknown>;

export type ContextAdaptersLike = Record<string, Adapter<unknown, unknown>>;

export type ContextLike = {
	palette?: ContextPaletteLike;
	adapters?: ContextAdaptersLike;
};

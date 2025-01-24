import type { BiMap } from '@/seriall/utils.ts';

export type SeriallValues = BiMap<string, unknown>;

export type SeriallAdapter<T, P> = {
	serialize(obj: T): P;
	deserialize(pure: P): T;
};
export type SeriallAdapters = Map<string, SeriallAdapter<unknown, unknown>>;

export type SeriallContext = {
	values: SeriallValues;
	adapters: SeriallAdapters;
};

// Index
export * as sync from '@/seriall-sync/index.ts';

// Common
export * from '@/seriall/index.ts';

// Sync
export { BUILTIN_ADAPTERS_SYNC as BUILTIN_ADAPTERS } from '@/seriall-sync/builtin/adapters.ts';

export {
	type AdapterSync as Adapter,
	type ContextAdaptersSync as ContextAdapters,
	type ContextAdaptersSyncLike as ContextAdaptersLike,
	type ContextSync as Context,
	type ContextSyncLike as ContextLike,
} from '@/seriall-sync/core/context.ts';

export { obj2puresSync as obj2pures, pures2objSync as pures2obj } from '@/seriall-sync/core/core.ts';

export {
	deserializeRecursivelySync as deserializeRecursively,
	serializeRecursivelySync as serializeRecursively,
} from '@/seriall-sync/core/serialization.ts';

export {
	deepCloneSync as deepClone,
	parseSync as parse,
	purifySync as purify,
	type SeriallOptionsSync as SeriallOptions,
	stringifySync as stringify,
} from '@/seriall-sync/seriall-sync.ts';

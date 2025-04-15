import type { ContextAdaptersAsync } from '../core/context.ts';
import { BUILTIN_ADAPTERS_SYNC } from '../../seriall-sync/builtin/adapters.ts';

/**
 * @see BUILTIN_ADAPTERS_SYNC
 */
export const BUILTIN_ADAPTERS_ASYNC: ContextAdaptersAsync = new Map([...BUILTIN_ADAPTERS_SYNC.entries()]);

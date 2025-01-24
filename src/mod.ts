export type { SeriallOptions } from '@/seriall.ts';
export * from '@/seriall/core/context.ts';
export * from '@/seriall/core/error.ts';
export * from '@/seriall/core/pure.ts';
export { BiMap } from '@/seriall/utils.ts';
import { isGlobalSymbol, withSupers } from '@/seriall/utils.ts';

import { deepClone, parse, parsePures, purify, stringify } from '@/seriall.ts';
import { obj2pures, pures2obj } from '@/seriall/core.ts';
import { BUILTIN_ADAPTERS, BUILTIN_VALUES } from '@/seriall/builtin.ts';

/**
 * Seriall is a simple serialization library.
 */
const seriall = {
	stringify,
	parse,
	deepClone,
	purify,
	parsePures,
	BUILTIN_VALUES,
	BUILTIN_ADAPTERS,
	core: {
		obj2pures,
		pures2obj,
	},
	utils: {
		isGlobalSymbol,
		withSupers,
	},
};

export default seriall;

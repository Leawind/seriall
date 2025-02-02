import { BiMap } from '@/seriall/utils/bimap.ts';
import type { ContextPalette } from '@/seriall/core/context.ts';

/**
 * Palette for built-in global values.
 *
 * Include functions and objects.
 */
export const BUILTIN_PALETTE: ContextPalette = (() => {
	const context = new BiMap<string, unknown>();

	const globalProps = new Function('return this')();
	const globalPropPairs = Object
		.getOwnPropertyNames(globalProps)
		.map<[string, unknown]>((name) => [name, globalProps[name]])
		.filter(([_, value]) =>
			(typeof value === 'function') ||
			(typeof value === 'object' && value !== null)
		);

	return context
		.setPairs(globalPropPairs)
		// This is special.
		// Different from other prototypes, `typeof Function.prototype` is `'function'`
		// Refer to [Function.prototype is a function](https://stackoverflow.com/questions/32928810/function-prototype-is-a-function)
		.set('Function.prototype', Function.prototype);
})();

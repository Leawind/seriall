import { BiMap } from '@leawind/bimap';
import type { ContextPalette } from '../core/context.ts';

/**
 * Palette for built-in global values.
 *
 * Include functions and objects.
 */
export const BUILTIN_PALETTE: ContextPalette = (() => {
	const context = new BiMap<string, unknown>();

	// Get global properties
	const globalProps = new Function('return this')();

	const globalPropPairs: [string, unknown][] = Object
		.getOwnPropertyNames(globalProps)
		.map<[string, unknown]>((key) => [key, globalProps[key]])
		.filter(([_key, value]) =>
			(typeof value === 'function') ||
			(typeof value === 'object' && value !== null)
		);

	return context
		.setAll(globalPropPairs)
		// This is special.
		// Different from other prototypes, `typeof Function.prototype` is `'function'`
		// Refer to [Function.prototype is a function](https://stackoverflow.com/questions/32928810/function-prototype-is-a-function)
		.set('Function.prototype', Function.prototype);
})();

import BiMap from '@/seriall/utils/bimap.ts';
export { BiMap };
/**
 * Checks if a symbol is registered in the global symbol registry.
 *
 * If true, it can be accessed by `Symbol.for()`
 *
 * @param  sb - The symbol to check
 * @returns   True if the symbol exists in the global registry, false otherwise
 */
export function isGlobalSymbol(sb: symbol) {
	return Symbol.keyFor(sb) !== undefined;
}

/**
 * Builds inheritance chain mapping for a class
 *
 * @param clazz - Class constructor to traverse
 * @returns Object mapping class names to their prototypes
 *
 * @example
 * class Parent {}
 * class Child extends Parent {}
 *
 * const result = withSupers(Child);
 * // Result:
 * {
 *   Child: Child,
 *   Parent: Parent,
 * }
 */
export function withSupers(
	clazz: new (...args: unknown[]) => unknown,
): Record<string, unknown> {
	const m = {
		[clazz.name]: clazz,
	};
	let sup = Object.getPrototypeOf(clazz);
	while (sup !== Function.prototype) {
		m[sup.name] = sup;
		sup = Object.getPrototypeOf(sup);
	}
	return m;
}

/**
 * Converts a symbol to its human-readable string representation
 *
 * @param sb - Symbol to stringify
 * @returns Formal symbol notation with proper quote escaping
 */
export function symbolToString(sb: symbol): string {
	return sb.description
		? `Symbol("${sb.description.replaceAll('"', '\\"')}")`
		: `Symbol()`;
}

/**
 * Checks if an object looks like a prototype.
 *
 * @param obj - The object to check
 * @returns True if the object looks like a prototype, false otherwise
 */
export function looksLikePrototype(obj: unknown) {
	if (obj === undefined) {
		return false;
	} else if (obj === null) {
		return false;
	}

	const constructor = Object.getOwnPropertyDescriptor(obj, 'constructor');

	if (constructor === undefined) {
		return false;
	} else {
		return !(obj instanceof constructor.value);
	}
}

/**
 * Checks if an object looks like a class.
 *
 * @param obj - The object to check
 * @returns `true` if the object looks like a class, `false` otherwise
 */
export function looksLikeClass(obj: unknown): boolean {
	if (obj === undefined || obj === null) {
		return false;
	} else {
		return obj.constructor === Function &&
			typeof obj === 'function' &&
			/^[A-Z].*$/.test(obj.name);
	}
}

/**
 * Clones a pure function by recreating it from its source code.
 *
 * @template F - Generic type representing the input function type
 * @param func - The pure function to clone. Must be a function with a parsable definition
 * @returns A new function with the same implementation as the original
 * @throws {Error} If the function's source code cannot be parsed into a valid format
 *
 * @example
 * // Clone a regular function
 * function add(a: number, b: number): number { return a + b; }
 * const clonedAdd = clonePureFunction(add);
 * console.log(clonedAdd(2, 3)); // 5
 */
export function clonePureFunction<F extends (...args: never[]) => unknown>(
	func: F,
): F {
	type FunctionPattern = {
		regex: RegExp;
		paramIndex: number;
		bodyIndex: number;
		bodyWrapper?: (body: string) => string;
	};

	const funcStr = func.toString();

	const patterns: FunctionPattern[] = [
		// Regular function: function name(...) { ... }
		{
			regex: /^function\s*[\w$]*\s*\(([^)]*)\)\s*\{([\s\S]*)\}$/,
			paramIndex: 1,
			bodyIndex: 2,
		},
		// Arrow function with braces: (...) => { ... }
		{
			regex: /^\(?([^)]*)\)?\s*=>\s*\{([\s\S]*)\}$/,
			paramIndex: 1,
			bodyIndex: 2,
		},
		// Arrow function without braces: (...) => ...
		{
			regex: /^(?:\(([^)]*)\)|([\w$]+))\s*=>\s*(.+)$/,
			paramIndex: 1,
			bodyIndex: 3,
			bodyWrapper: (body) => `return ${body};`,
		},
	];

	let args: string[] = [];
	let body: string = '';

	for (const pattern of patterns) {
		const match = funcStr.match(pattern.regex);
		if (match) {
			const rawParams = match[pattern.paramIndex] || '';
			args = rawParams
				.split(',')
				.map((p) => p.trim())
				.filter((p) => p.length > 0);

			if (args.length === 1 && args[0].includes('=>')) {
				args[0] = args[0].replace(/\s*=>.*/, '');
			}

			body = match[pattern.bodyIndex]?.trim() || '';
			if (pattern.bodyWrapper) {
				body = pattern.bodyWrapper(body);
			}
			break;
		}
	}

	if (!args || !body) {
		throw new Error('Failed to parse function definition');
	}

	let cloned: F;
	try {
		cloned = new Function(...args, body) as F;
	} catch (e) {
		throw new Error(
			`Failed to reconstruct function: ${
				e instanceof Error ? e.message : String(e)
			}`,
		);
	}
	cloned.prototype = func.prototype;
	return cloned;
}

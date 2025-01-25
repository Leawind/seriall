import type { Adapter, Context } from '@/seriall/core/context.ts';
import {
	type Pure,
	type PureIndex,
	PureKey,
	PureType,
} from '@/seriall/core/pure.ts';
import { isGlobalSymbol, looksLikePrototype } from '@/seriall/utils.ts';
import {
	SeriallInvalidPureError,
	SeriallReferredAdapterNotFoundError,
	SeriallReferredValueNotFoundError,
	SeriallResolveFailedError,
} from '@/seriall/core/error.ts';

import { SpecialPureValue } from '@/seriall/core/pure.ts';
/**
 * Recursively sets a pure value.
 *
 * @template T
 * @param {T} obj - Object to be serialized
 * @param {Pure[]} pures - Array of pure values
 * @param {Context[]} contexts - Array of contexts
 * @param {Map<unknown, number>} [seen=new Map()] - Map of seen objects
 * @returns {PureIndex} - Index of the pure value
 */
export function serializeRecursively<T>(
	obj: T,
	pures: Pure[],
	contexts: Context[],
	seen: Map<unknown, number> = new Map(),
): PureIndex {
	function set(v: unknown): PureIndex {
		return serializeRecursively(v, pures, contexts, seen);
	}

	// Search obj in map. If `obj` is already in `pures`, just return its index
	if (seen.has(obj)) {
		return seen.get(obj)!;
	}

	const index = pures.length;
	seen.set(obj, index);
	pures.push(null);

	// Create a new `Pure`
	let pure: Pure;

	// Search obj in context values
	let ctxKey: string | null = null;
	for (const context of contexts) {
		if (context.values.hasValue(obj)) {
			ctxKey = context.values.getKey(obj);
			break;
		}
	}

	if (ctxKey !== null) {
		// Found it in context values, just refer to that value
		pure = {
			[PureKey.Type]: PureType.RefValue,
			[PureKey.Key]: ctxKey,
		};
	} else {
		switch (typeof obj) {
			case 'boolean':
			case 'string':
				pure = obj;
				break;
			case 'number':
				if (isNaN(obj)) {
					pure = {
						[PureKey.Type]: PureType.Special,
						[PureKey.Value]: SpecialPureValue.Nan,
					};
				} else if (obj === Infinity) {
					pure = {
						[PureKey.Type]: PureType.Special,
						[PureKey.Value]: SpecialPureValue.pInfinity,
					};
				} else if (obj === -Infinity) {
					pure = {
						[PureKey.Type]: PureType.Special,
						[PureKey.Value]: SpecialPureValue.mInfinity,
					};
				} else {
					pure = obj;
				}
				break;
			case 'bigint':
				pure = {
					[PureKey.Type]: PureType.BigInt,
					[PureKey.Value]: (obj as bigint).toString(),
				};
				break;
			case 'undefined':
				pure = {
					[PureKey.Type]: PureType.Special,
					[PureKey.Value]: SpecialPureValue.Undefined,
				};
				break;
			case 'symbol':
				if (isGlobalSymbol(obj)) {
					pure = {
						[PureKey.Type]: PureType.Symbol,
						[PureKey.Key]: obj.description!,
					};
					break;
				} else {
					throw new SeriallResolveFailedError(obj);
				}
			case 'function':
				throw new SeriallResolveFailedError(obj);
			case 'object':
				if (obj === null) {
					pure = null;
				} else {
					if (looksLikePrototype(obj)) {
						pure = {
							[PureKey.Type]: PureType.Prototype,
							[PureKey.Class]: set(obj.constructor),
						};
					} else {
						// Search `obj.constructor.name` in context adapters
						let adapter: Adapter<unknown, unknown> | null = null;
						for (const context of contexts) {
							if (context.adapters.has(obj.constructor.name)) {
								adapter = context.adapters
									.get(obj.constructor.name)!;
							}
						}
						if (adapter !== null) {
							// Found a matched adapter, use that adapter to serialize `obj`
							pure = {
								[PureKey.Type]: PureType.RefAdapter,
								[PureKey.Name]: obj.constructor.name,
								[PureKey.Value]: set(adapter.serialize(obj)),
							};
						} else if (Array.isArray(obj)) {
							pure = [];
							for (const subObj of obj) {
								pure.push(set(subObj));
							}
						} else {
							pure = {
								[PureKey.Type]: PureType.Object,
								[PureKey.Class]: set(obj.constructor),
								[PureKey.Properties]: [],
							};
							for (
								const name of Object.getOwnPropertyNames(obj)
							) {
								const desc = Object
									.getOwnPropertyDescriptor(obj, name)!;
								pure[PureKey.Properties].push([
									name,
									set(desc.value),
									{
										...(desc.writable === false &&
											{ [PureKey.Writable]: false }),
										...(desc.enumerable === false &&
											{ [PureKey.Enumerable]: false }),
										...(desc.configurable === false &&
											{ [PureKey.Configurable]: false }),
									},
								]);
							}
						}
					}
				}
				break;
			default:
				throw new Error(`Unsupported type: "${typeof obj}"`);
		}
	}
	pures[index] = pure;
	return index;
}

/**
 * Recursively gets an object from a array of `SeriallPure`.
 *
 * @template T Type of deserialized object
 * @param {PureIndex} index - Index of the pure value
 * @param {Pure[]} pures - Array of pure values
 * @param {Context[]} contexts - Array of contexts
 * @param {Map<number, unknown>} [seen=new Map()] - Map of seen objects
 * @returns {T} - Deserialized object
 */
export function deserializeRecursively<T>(
	index: PureIndex,
	pures: Pure[],
	contexts: Context[],
	seen: Map<number, unknown> = new Map(),
): T {
	function get<V>(id: PureIndex): V {
		return deserializeRecursively<V>(id, pures, contexts, seen);
	}

	if (seen.has(index)) {
		return seen.get(index) as T;
	}

	const pure = pures[index];
	let result: T;
	let found = false;

	switch (typeof pure) {
		case 'string':
		case 'number':
		case 'boolean':
			result = pure as T;
			break;
		case 'object':
			if (pure === null) {
				result = null as T;
			} else if (Array.isArray(pure)) {
				result = pure.map(get) as T;
			} else {
				switch (pure[PureKey.Type]) {
					case PureType.Symbol:
						result = Symbol.for(pure[PureKey.Key]) as T;
						break;
					case PureType.BigInt:
						result = BigInt(pure[PureKey.Value] as string) as T;
						break;
					case PureType.Special:
						switch (pure[PureKey.Value]) {
							case SpecialPureValue.Undefined:
								result = undefined as T;
								break;
							case SpecialPureValue.Nan:
								result = NaN as T;
								break;
							case SpecialPureValue.pInfinity:
								result = Infinity as T;
								break;
							case SpecialPureValue.mInfinity:
								result = -Infinity as T;
								break;
							default:
								throw new SeriallInvalidPureError(pure);
						}
						break;
					case PureType.RefValue: {
						// search the key in contexts
						for (const context of contexts) {
							if (context.values.hasKey(pure[PureKey.Key])) {
								result = context.values
									.getValue(pure[PureKey.Key]);
								found = true;
								break;
							}
						}
						if (found) {
							break;
						} else {
							throw new SeriallReferredValueNotFoundError(pure);
						}
					}
					case PureType.RefAdapter: {
						// search the adapter by its name in contexts
						for (const context of contexts) {
							if (context.adapters.has(pure[PureKey.Name])) {
								found = true;
								result = context.adapters
									.get(pure[PureKey.Name])!
									.deserialize(get(pure[PureKey.Value])) as T;
								break;
							}
						}
						if (found) {
							break;
						} else {
							throw new SeriallReferredAdapterNotFoundError(pure);
						}
					}
					case PureType.Prototype:
						result = (get(pure[PureKey.Class]) as { prototype: T })
							.prototype;
						break;
					case PureType.Object: {
						const obj = Object.create(
							get<{ prototype: object }>(pure[PureKey.Class])
								.prototype,
						);
						result = obj as T;
						seen.set(index, result);
						for (
							const [key, valueIndex, desc]
								of pure[PureKey.Properties]
						) {
							Object.defineProperty(
								obj,
								key,
								{
									value: get(valueIndex),
									enumerable:
										desc[PureKey.Enumerable] !== false,
									writable: desc[PureKey.Writable] !== false,
									configurable:
										desc[PureKey.Configurable] !== false,
								},
							);
						}
						break;
					}
					default:
						throw new SeriallInvalidPureError(
							pure,
							`Unrecognized type: ${pure[PureKey.Type]}`,
						);
				}
			}
			break;
		default:
			throw new Error(`Invalid pure value type: ${typeof pure}`);
	}

	seen.set(index, result!);
	return result!;
}

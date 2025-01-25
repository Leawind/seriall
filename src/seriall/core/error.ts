import { symbolToString } from '../utils.ts';
import type { PureRefAdapter, PureRefValue } from '@/seriall/core/pure.ts';

export class SeriallError extends Error {}

/**
 * Occurs when an invalid `pure.type` is encountered.
 *
 * This could happen if the serialized data is from an incompatible or older version of `Seriall`.
 */
export class SeriallInvalidPureError extends SeriallError {
	constructor(pure: unknown, desc: string = '') {
		super(`Invalid Pure: ${pure}\n${desc}`);
	}
}

/**
 * Thrown during **serialization** when a value cannot be directly serialized
 * and isn't present in any contexts.
 *
 * **Typical scenarios:**
 * - Symbols not explicitly added to serialization context
 *
 * **Resolution example:**
 *
 * ```ts
 * seriall.stringify(obj, { values: { MissingValue } })
 * ```
 */
export class SeriallResolveFailedError<T> extends SeriallError {
	constructor(cause: T) {
		const desc = typeof cause === 'symbol'
			? symbolToString(cause)
			: cause?.toString();
		super(`Value not found in any context: ${desc}`, { cause });
	}
}

/**
 * Occurs during **deserialization** when a reference points to a **value** that doesn't exist in any context.
 */
export class SeriallReferredValueNotFoundError extends SeriallError {
	constructor(pure: PureRefValue) {
		super(
			`Value key "${pure.K}" wasn't found in any context`,
			{ cause: pure },
		);
	}
}

/**
 * Occurs during **deserialization** when a reference points to an **adapter** isn't present in any context.
 */
export class SeriallReferredAdapterNotFoundError extends SeriallError {
	constructor(pure: PureRefAdapter) {
		super(
			`Adapter name "${pure.N}" wasn't found in any context`,
			{ cause: pure },
		);
	}
}

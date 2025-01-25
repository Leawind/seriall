import { assertThrows } from '@std/assert/throws';
import {
	SeriallInvalidPureError,
	SeriallReferredAdapterNotFoundError,
	SeriallReferredValueNotFoundError,
	SeriallResolveFailedError,
} from '@/seriall/core/error.ts';
import * as seriall from '@/mod.ts';
import type { Pure } from '@/seriall/core/pure.ts';

Deno.test(function testSeriallResolveFailedError() {
	assertThrows(
		() => seriall.stringify(Symbol('Hey')),
		SeriallResolveFailedError,
	);
});
Deno.test(function testSeriallReferredValueNotFoundError() {
	const hey = Symbol('Hey');

	const json = seriall.stringify(hey, { palette: { hey } });
	assertThrows(
		() => seriall.parse(json),
		SeriallReferredValueNotFoundError,
	);
});
Deno.test(function testSeriallReferredAdapterNotFoundError() {
	const json = seriall.stringify(new Date());
	assertThrows(
		() => seriall.parse(json, { builtinAdapters: false }),
		SeriallReferredAdapterNotFoundError,
	);
});
Deno.test(function testSeriallInvalidPureTypeError() {
	const pures = [{ type: 'no such type' }] as unknown as Pure[];
	assertThrows(
		() => seriall.core.pures2obj(pures, []),
		SeriallInvalidPureError,
	);
});

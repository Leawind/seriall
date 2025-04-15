import { assertThrows } from '@std/assert/throws';
import { seriall_sync as seriall } from '../src/index.ts';

Deno.test('Throw SeriallResolveFailedError when serializing Symbol', () => {
	assertThrows(
		() => seriall.stringify(Symbol('Hey')),
		seriall.SeriallResolveFailedError,
	);
});
Deno.test('Throw SeriallReferredValueNotFoundError when parsing missing referred value', () => {
	const hey = Symbol('Hey');

	const json = seriall.stringify(hey, { palette: { hey } });
	assertThrows(
		() => seriall.parse(json),
		seriall.SeriallReferredValueNotFoundError,
	);
});
Deno.test('Throw SeriallReferredAdapterNotFoundError when parsing without builtin adapters', () => {
	const json = seriall.stringify(new Date());
	assertThrows(
		() => seriall.parse(json, { builtinAdapters: false }),
		seriall.SeriallReferredAdapterNotFoundError,
	);
});
Deno.test('Throw SeriallInvalidPureError for invalid pure type', () => {
	const pures = [{ type: 'no such type' }] as unknown as seriall.Pure[];
	assertThrows(
		() => seriall.pures2obj(pures, []),
		seriall.SeriallInvalidPureError,
	);
});

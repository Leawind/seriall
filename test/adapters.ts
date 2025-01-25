import { assert } from '@std/assert/assert';
import { assertFalse } from '@std/assert/false';
import { assertStrictEquals } from '@std/assert/strict-equals';
import * as seriall from '@/mod.ts';

Deno.test(function testDate() {
	const dates = {
		guoqing: new Date(`1949-10-1`),
		now: new Date(),
	};

	assertStrictEquals(
		seriall.stringify(dates),
		seriall.stringify(seriall.deepClone(dates)),
	);
});

Deno.test(function testSet() {
	const object = new Set([2, 3, 5, 7, 9]);
	const cloned = seriall.deepClone(object);

	assert(cloned.has(2));
	assert(cloned.has(3));
	assert(cloned.has(5));
	assert(cloned.has(7));
	assert(cloned.has(9));

	assertFalse(cloned.has(1));
});

Deno.test(function testMap() {
	const object = new Map<unknown, unknown>([
		['name', 'Steve'],
		['pos', [-2, 64, 1.23]],
		['effect', new Set()],
	]);
	const cloned = seriall.deepClone(object);

	assertStrictEquals(cloned.get('name'), 'Steve');
	assert((cloned.get('pos') as number[])[2] === 1.23);
	assert(cloned.get('effect') instanceof Set);
});

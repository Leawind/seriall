import {
	assert,
	assertFalse,
	assertStrictEquals,
	assertThrows,
} from '@std/assert';
import seriall from '@/mod.ts';
import { BUILTIN_ADAPTERS, BUILTIN_VALUES } from '@/seriall/builtin.ts';
import { looksLikeClass } from '@/seriall/utils.ts';

Deno.test(function find() {
	const IGNORED = new Set<unknown>([
		Array,
		Function,
		Object,
		BigInt,
		Symbol,
		Promise,
	]);
	const classes: string[] = [];
	for (const [name, object] of BUILTIN_VALUES.entries()) {
		if (!IGNORED.has(object)) {
			if (looksLikeClass(object) && !BUILTIN_ADAPTERS.has(name)) {
				classes.push(name);
			}
		}
	}
	console.log(`These builtin functions have no adapter:`);
	console.log(classes.join(', '));
});

Deno.test(function testNumber() {
	const origin = new Number(12138);
	const cloned = seriall.deepClone<typeof origin>(origin);
	assert(cloned instanceof Number);
	assertStrictEquals(origin.toString(), cloned.toString());
});
Deno.test(function testBoolean() {
	const origin = new Boolean(12138);
	const cloned = seriall.deepClone<typeof origin>(origin);
	assert(cloned instanceof Boolean);
	assertStrictEquals(origin.toString(), cloned.toString());
});
Deno.test(function testString() {
	const origin = new String('Hello world!');
	const cloned = seriall.deepClone<typeof origin>(origin);
	assert(cloned instanceof String);
	assertStrictEquals(origin.toString(), cloned.toString());
});

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
	const original = new Set([2, 'str', 5, 7, 9]);
	console.log(seriall.purify(original));
	const cloned = seriall.deepClone(original);

	[2, 'str', 5, 7, 9]
		.forEach((v) => assert(cloned.has(v)));

	assertFalse(cloned.has(1));
});

Deno.test(function testMap() {
	const original = new Map<unknown, unknown>([
		['name', 'Steve'],
		['pos', [-2, 64, 1.23]],
		['effect', new Set()],
	]);
	const cloned = seriall.deepClone(original);

	assertStrictEquals(cloned.get('name'), 'Steve');
	assert((cloned.get('pos') as number[])[2] === 1.23);
	assert(cloned.get('effect') instanceof Set);
});

Deno.test(function testRegExp() {
	const original = {
		email: /^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b$/,
		telephone: /^\b1[3-9]\d{9}\b$/,
	};

	const cloned = seriall.deepClone<typeof original>(original);

	assertStrictEquals(
		original.email.toString(),
		cloned.email.toString(),
	);
	assertStrictEquals(
		original.telephone.toString(),
		cloned.telephone.toString(),
	);
});

Deno.test(function testURL() {
	const url = new URL(
		'proto://alice:123456@subdomain.domain/path/to/resource?search=中文&password=213#header',
	);
	const cloned = seriall.deepClone<typeof url>(url);

	assertStrictEquals(url.href, cloned.href);
	assertStrictEquals(url.protocol, cloned.protocol);
	assertStrictEquals(url.username, cloned.username);
	assertStrictEquals(url.password, cloned.password);
	assertStrictEquals(url.host, cloned.host);
	assertStrictEquals(url.port, cloned.port);
	assertStrictEquals(url.pathname, cloned.pathname);
	assertStrictEquals(url.search, cloned.search);
	assertStrictEquals(url.hash, cloned.hash);
});

Deno.test(function testURLPattern() {
	const pattern = new URLPattern({
		protocol: 'https',
		hostname: 'example.com',
		pathname: '/path/:id',
	});
	const cloned = seriall.deepClone<typeof pattern>(pattern);

	assertStrictEquals(pattern.protocol, cloned.protocol);
	assertStrictEquals(pattern.hostname, cloned.hostname);
	assertStrictEquals(pattern.pathname, cloned.pathname);
	assertStrictEquals(
		pattern.test('https://example.com/path/123'),
		cloned.test('https://example.com/path/123'),
	);
});

Deno.test(function testArrayBufferInObject() {
	const original = {
		id: 'binary-data',
		meta: new Map([['size', 3]]),
		buffer: new Uint8Array([255, 0, 127]).buffer,
	};

	const cloned = seriall.deepClone(original);

	const originalBufferView = new Uint8Array(original.buffer);
	const clonedBufferView = new Uint8Array(cloned.buffer);

	assertStrictEquals(originalBufferView.length, clonedBufferView.length);
	for (let i = 0; i < originalBufferView.length; i++) {
		assertStrictEquals(originalBufferView[i], clonedBufferView[i]);
	}
});

Deno.test(function testArrayBuffer_Empty() {
	const original = new ArrayBuffer(0);
	const cloned = seriall.deepClone(original);
	assertStrictEquals(cloned.byteLength, 0);
});

Deno.test(function test16bitsArray() {
	[
		...[Uint8ClampedArray, Uint8Array, Int8Array],
		...[Uint16Array, Int16Array, Float16Array],
		...[Uint32Array, Int32Array, Float32Array],
		Float64Array,
	].forEach((clazz) => {
		const original = new clazz([
			-4294967296,
			-2147483648,
			-65536,
			-32768,
			-256,
			-128,
			0,
			127,
			255,
			32767,
			65535,
			2147483647,
			4294967295,
		]);
		const cloned = seriall.deepClone(original);

		assertStrictEquals(original.length, cloned.length);
		for (let i = 0; i < original.length; i++) {
			assertStrictEquals(original[i], cloned[i]);
		}
	});
});

Deno.test(function testBigUint64Array() {
	[BigUint64Array, BigInt64Array]
		.forEach((clazz) => {
			const original = new clazz([
				0n,
				18446744073709551615n,
				12345678901234567890n,
			]);
			const cloned = seriall.deepClone(original);

			assertStrictEquals(original.length, cloned.length);
			for (let i = 0; i < original.length; i++) {
				assertStrictEquals(original[i], cloned[i]);
			}
		});
});

Deno.test(function testDataView() {
	const buffer = new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]).buffer;

	const original = new DataView(buffer, 2, 4);

	const cloned = seriall.deepClone(original);

	assertStrictEquals(original.byteOffset, cloned.byteOffset);
	assertStrictEquals(original.byteLength, cloned.byteLength);

	const originalBuffer = new Uint8Array(original.buffer);
	const clonedBuffer = new Uint8Array(cloned.buffer);
	assertStrictEquals(originalBuffer.length, clonedBuffer.length);
	for (let i = 0; i < originalBuffer.length; i++) {
		assertStrictEquals(originalBuffer[i], clonedBuffer[i]);
	}
});

Deno.test(function testDataViewInObject() {
	const buffer =
		new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).buffer;

	const original = {
		head: new DataView(buffer, 0, 4),
		tail: new DataView(buffer, 7, 4),
	};

	const cloned = seriall.deepClone(original);

	assertStrictEquals(
		cloned.head.buffer,
		cloned.tail.buffer,
	);
});

Deno.test(function testDataViewInObjectRefValue() {
	const buffer =
		new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).buffer;

	const original = {
		head: new DataView(buffer, 0, 4),
		tail: new DataView(buffer, 7, 4),
	};

	const options = { values: { buffer } };

	const cloned = seriall.deepClone(original, options);

	assertStrictEquals(cloned.head.buffer, buffer);
	assertStrictEquals(cloned.tail.buffer, buffer);

	original.head.setInt8(0, 99);
	assertStrictEquals(cloned.head.getInt8(0), 99);

	cloned.tail.setInt8(0, 77);
	assertStrictEquals(original.tail.getInt8(0), 77);
});

Deno.test(function testUnserializable() {
	assertThrows(
		() => seriall.purify(new WeakMap()),
		Error,
	);
	assertThrows(
		() => seriall.purify(new WeakSet()),
		Error,
	);
	assertThrows(
		() => seriall.purify(new WeakRef({})),
		Error,
	);
});

Deno.test(function testURLSearchParams() {
	[
		new URLSearchParams('a=1&b=&c=hello%20world'),
		new URLSearchParams('a=1&a=2&a=3'),
		new URLSearchParams('key=='),
		new URLSearchParams(),
	].forEach((original) => {
		const cloned = seriall.deepClone(original);
		assertStrictEquals(
			original.toString(),
			cloned.toString(),
			`Failed case: ${original.toString()}`,
		);
	});
});

Deno.test(function testURLSearchParamsSorting() {
	const orderedParams = new URLSearchParams();
	orderedParams.append('z', '3');
	orderedParams.append('a', '1');
	orderedParams.append('m', '2');

	const cloned = seriall.deepClone(orderedParams);

	assertStrictEquals([...cloned.keys()].join(','), 'z,a,m');
});

import { assert, assertFalse, assertStrictEquals, assertThrows } from '@std/assert';
import { seriall_sync as seriall } from '@/index.ts';

import { BUILTIN_PALETTE } from '@/seriall/builtin/palette.ts';
import { looksLikeClass } from '@/seriall/utils.ts';

Deno.test('Find classes without adapters in BUILTIN_PALETTE', () => {
	const IGNORED = new Set<unknown>([
		Array,
		Function,
		Object,
		BigInt,
		Symbol,
		Promise,
	]);
	const classes: string[] = [];
	for (const [name, object] of BUILTIN_PALETTE.entries()) {
		if (!IGNORED.has(object)) {
			if (looksLikeClass(object) && !seriall.BUILTIN_ADAPTERS.has(name)) {
				classes.push(name);
			}
		}
	}
	console.log(`These builtin functions have no adapter:`);
	console.log(classes.join(', '));
});

Deno.test('Deep clone Number object', () => {
	const original = new Number(12138);
	const cloned = seriall.deepClone<typeof original>(original);
	assert(cloned instanceof Number);
	assertStrictEquals(original.toString(), cloned.toString());
});
Deno.test('Deep clone Boolean object', () => {
	const original = new Boolean(12138);
	const cloned = seriall.deepClone<typeof original>(original);
	assert(cloned instanceof Boolean);
	assertStrictEquals(original.toString(), cloned.toString());
});
Deno.test('Deep clone String object', () => {
	const original = new String('Hello world!');
	const cloned = seriall.deepClone<typeof original>(original);
	assert(cloned instanceof String);
	assertStrictEquals(original.toString(), cloned.toString());
});

Deno.test('Deep clone Date object', () => {
	const dates = {
		guoqing: new Date(`1949-10-1`),
		now: new Date(),
	};

	assertStrictEquals(
		seriall.stringify(dates),
		seriall.stringify(seriall.deepClone(dates)),
	);
});

Deno.test('Deep clone Set object', () => {
	const original = new Set([2, 'str', 5, 7, 9]);
	console.log(seriall.purify(original));
	const cloned = seriall.deepClone(original);

	[2, 'str', 5, 7, 9]
		.forEach((v) => assert(cloned.has(v)));

	assertFalse(cloned.has(1));
});

Deno.test('Deep clone Map object', () => {
	const original = new Map<unknown, unknown>([
		['name', 'Steve'],
		['pos', [-2, 64, 1.23]],
		['set', new Set()],
	]);
	const cloned = seriall.deepClone(original);

	assertStrictEquals(cloned.get('name'), 'Steve');
	assert((cloned.get('pos') as number[])[2] === 1.23);
	assert(cloned.get('set') instanceof Set);
});

Deno.test('Deep clone RegExp object', () => {
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

Deno.test('Deep clone URL object', () => {
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

Deno.test('Deep clone URLPattern object', () => {
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

Deno.test('Deep clone ArrayBuffer in object', () => {
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

Deno.test('Deep clone empty ArrayBuffer', () => {
	const original = new ArrayBuffer(0);
	const cloned = seriall.deepClone(original);
	assertStrictEquals(cloned.byteLength, 0);
});

Deno.test('Deep clone TypedArray objects', () => {
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

Deno.test('Deep clone long TypedArray objects', () => {
	[
		...[Uint8ClampedArray, Uint8Array, Int8Array],
		...[Uint16Array, Int16Array, Float16Array],
		...[Uint32Array, Int32Array, Float32Array],
		Float64Array,
	].forEach((clazz) => {
		const SIZE = 16384;
		const original = new clazz(new Array(SIZE).fill(2));
		const cloned = seriall.deepClone(original);

		assertStrictEquals(original.length, cloned.length);
		for (let i = 0; i < original.length; i++) {
			assertStrictEquals(original[i], cloned[i]);
		}
	});
});

Deno.test('Deep clone BigUint64Array and BigInt64Array objects', () => {
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

Deno.test('Deep clone DataView object', () => {
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

Deno.test('Deep clone DataView in object', () => {
	const buffer = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).buffer;

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

Deno.test('Deep clone DataView in object with reference value', () => {
	const buffer = new Uint8Array([10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]).buffer;

	const original = {
		head: new DataView(buffer, 0, 4),
		tail: new DataView(buffer, 7, 4),
	};

	const options: seriall.ContextPaletteLike = { palette: { buffer } };

	const cloned = seriall.deepClone(original, options);

	assertStrictEquals(cloned.head.buffer, buffer);
	assertStrictEquals(cloned.tail.buffer, buffer);

	original.head.setInt8(0, 99);
	assertStrictEquals(cloned.head.getInt8(0), 99);

	cloned.tail.setInt8(0, 77);
	assertStrictEquals(original.tail.getInt8(0), 77);
});

Deno.test('Purify unserializable objects', () => {
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

Deno.test('Deep clone URLSearchParams object', () => {
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

Deno.test('Deep clone URLSearchParams with sorting', () => {
	const orderedParams = new URLSearchParams();
	orderedParams.append('z', '3');
	orderedParams.append('a', '1');
	orderedParams.append('m', '2');

	const cloned = seriall.deepClone(orderedParams);

	assertStrictEquals([...cloned.keys()].join(','), 'z,a,m');
});

Deno.test('Deep clone ByteLengthQueuingStrategy object', () => {
	const original = new ByteLengthQueuingStrategy({ highWaterMark: 1024 });
	const cloned = seriall.deepClone(original);

	assertStrictEquals(original.highWaterMark, cloned.highWaterMark);

	const testChunk = new Uint8Array([1, 2, 3, 4]);
	assertStrictEquals(
		original.size(testChunk),
		cloned.size(testChunk),
	);
});
Deno.test('Deep clone basic ImageData object', () => {
	const data = new Uint8ClampedArray([
		...[255, 0, 0, 255],
		...[0, 255, 0, 255],
		...[0, 0, 255, 255],
		...[255, 255, 255, 0],
	]);
	const original = new ImageData(data, 2, 2);
	const cloned = seriall.deepClone(original);

	assertStrictEquals(original.width, cloned.width);
	assertStrictEquals(original.height, cloned.height);

	for (let i = 0; i < original.data.length; i++) {
		assertStrictEquals(original.data[i], cloned.data[i]);
	}
});

Deno.test('Deep clone large ImageData object', () => {
	const SIZE = 1024;
	const data = new Uint8ClampedArray(SIZE * SIZE * 4);
	for (let i = 0; i < data.length; i += 4) {
		data[i] = i % 256; // R
		data[i + 1] = (i + 1) % 256; // G
		data[i + 2] = (i + 2) % 256; // B
		data[i + 3] = 255; // A
	}

	const original = new ImageData(data, SIZE, SIZE);
	const cloned = seriall.deepClone(original);

	// 验证随机采样点
	const testIndexes = [0, 1024, data.length - 4];
	for (const i of testIndexes) {
		assertStrictEquals(original.data[i], cloned.data[i]);
		assertStrictEquals(original.data[i + 3], cloned.data[i + 3]);
	}
});
Deno.test('Deep clone basic Headers object', () => {
	const original = new Headers();
	original.set('Content-Type', 'application/json');
	original.append('Accept', 'text/html');
	original.append('Accept', 'application/xml');
	original.append('Content-Type', 'application/xml');

	const cloned = seriall.deepClone(original);

	assertStrictEquals(
		original.get('Content-Type'),
		cloned.get('Content-Type'),
	);
	assertStrictEquals(
		original.get('Accept'),
		cloned.get('Accept'),
	);
});

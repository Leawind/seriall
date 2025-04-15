import { assertThrows } from '@std/assert/throws';
import { assert } from '@std/assert/assert';

import { seriall_sync as seriall } from '../src/index.ts';

Deno.test('Serialize and print various values', () => {
	console.log(`| Value | Serialized |`);
	console.log(`|-|-|`);
	Object.entries({
		'true': true,
		'12138': 12138,
		'16n': 16n,
		"[80, 'http']": [80, 'http'],
		'Math': Math,
		'new Set()': new Set(),
		"{ name: 'Steve' }": { name: 'Steve' },
	}).map(([key, value]) =>
		[
			key,
			seriall.stringify(value).replace(/"(\w)":/g, '$1:'),
		].map((s) => '`' + s + '`')
	).map((s) => console.log('|', s.join(' | '), '|'));
});

Deno.test('Simple serialization and deserialization', () => {
	const alice = { name: '' };
	const json = seriall.stringify(alice);
	const dolly = seriall.parse<typeof alice>(json);

	assert(alice.name === dolly.name);
});

Deno.test('Serialize and deserialize custom class Sheep', () => {
	class Sheep {
		private name?: string;
		public constructor(name?: string) {
			this.name = name;
		}
		public setName(name: string) {
			this.name = name;
		}
		public getName(): string | undefined {
			return this.name;
		}
	}

	const options: seriall.ContextLike = { palette: { Sheep } };

	const sheep = new Sheep();
	const dolly = seriall.deepClone(sheep, options);

	assert(sheep instanceof Sheep);
	assert(dolly instanceof Sheep);
	assert(sheep !== dolly);
	assert(sheep.constructor === dolly.constructor);

	dolly.setName('Dolly');
	assert(dolly.getName() === 'Dolly');
});

Deno.test('Serialize and deserialize built-in classes', () => {
	const original = {
		array: [2, 3, 4],
		set: new Set([12138, 7355608]),
		map: new Map(Object.entries({ greet: 'hello world' })),
		typed_array: new Int8Array([7, 6, 5, 4, 3]),
	};

	// deepClone means serialize and then deserialize
	const cloned = seriall.deepClone(original);

	assert(cloned.array.length === 3);
	assert(cloned.set.has(12138));
	assert(cloned.map.has('greet'));
	assert(cloned.typed_array[2] === 5);
});

Deno.test('Serialize and deserialize custom class Cat', () => {
	class Cat {}
	const mimi = new Cat();

	// `mimi` is an instance of `Cat`, which is a custom Class.
	// If you don't tell it how to get `Cat`, it won't be able to deserialize `mimi` and make it an instance of `Cat`. Therefore it refuses to serialize it.
	assertThrows(
		() => seriall.purify(mimi),
		seriall.SeriallResolveFailedError,
	);

	// The second argument is telling seriall how to find class `Cat`: just by name "Cat"
	const pure = seriall.purify(mimi, { palette: { Cat: Cat } });
	console.debug(`mimi: `, pure);

	// I will be able to find `Cat` by name "Cat" when deserializing.
	const clonedMimi = seriall.parse(pure, { palette: { Cat } });
	assert(clonedMimi instanceof Cat);
});

Deno.test('Serialize and deserialize custom class Cat with method', () => {
	class Cat {
		meow: () => void = () => console.debug('Meow!');
	}

	const mimi = new Cat();

	// `mimi` is an instance of `Cat`, which is a custom Class.
	// If you don't tell me how to get `Cat`, I won't be able to deserialize `mimi` and make it an instance of `Cat`. Therefore I can't serialize it.
	assertThrows(
		() => seriall.purify(mimi),
		seriall.SeriallResolveFailedError,
	);

	// `mini` has a own property `meow`, it is a function.
	// This function is not provided in `values`, so it does not work.
	assertThrows(
		() => seriall.purify(mimi, { palette: { Cat } }),
		seriall.SeriallResolveFailedError,
	);
});

import { assertThrows } from '@std/assert/throws';
import { assert } from '@std/assert/assert';
import seriall, {
	BiMap,
	type SeriallOptions,
	SeriallResolveFailedError,
} from '@/mod.ts';

Deno.test(function tutorial_Simple() {
	const alice = { name: '' };
	const json = seriall.stringify(alice);
	const dolly = seriall.parse<typeof alice>(json);

	assert(alice.name === dolly.name);
});

Deno.test(function tutorial_Simple_Custom_Class() {
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

	const options: SeriallOptions = { values: { Sheep } };

	const sheep = new Sheep();
	const dolly = seriall.deepClone(sheep, options);

	assert(sheep instanceof Sheep);
	assert(dolly instanceof Sheep);
	assert(sheep !== dolly);
	assert(sheep.constructor === dolly.constructor);

	dolly.setName('Dolly');
	assert(dolly.getName() === 'Dolly');
});

Deno.test(function tutorial_Many_Types() {
	const ctx = { values: { BiMap } };

	const object = {
		simple: [10, 99n, 'str', false, null, undefined],
		array: [[[[[[[[[[[]]]]]]]]]]],
		infinite: [NaN, Infinity, -Infinity],
		builtin_value: [Math, JSON, Function, Object],
		builtin_adapters: [new Set(), new Map(), new Date()],
		custom_class: [new BiMap()],
	};
	const cloned = seriall.parse(seriall.stringify(object, ctx), ctx);

	assert(
		seriall.stringify(object, ctx) ===
			seriall.stringify(cloned, ctx),
	);
});

Deno.test(function tutorial_Custom_Class() {
	class Cat {}
	const mimi = new Cat();

	// `mimi` is an instance of `Cat`, which is a custom Class.
	// If you don't tell me how to get `Cat`, I won't be able to deserialize `mimi` and make it an instance of `Cat`. Therefore I can't serialize it.
	assertThrows(
		() => seriall.purify(mimi),
		SeriallResolveFailedError,
	);

	// Now you told me it's name is Cat, I will remember it
	const pure = seriall.purify(mimi, { values: { 'Cat': Cat } });
	console.debug(`mimi: `, pure);

	// I will be able to find `Cat` by name "Cat" when deserializing.
	const clonedMimi = seriall.parsePures(pure, { values: { Cat } });
	assert(clonedMimi instanceof Cat);
});

Deno.test(function tutorial_Custom_Class() {
	class Cat {
		meow: () => void = () => console.debug('Meow!');
	}

	const mimi = new Cat();

	// `mimi` is an instance of `Cat`, which is a custom Class.
	// If you don't tell me how to get `Cat`, I won't be able to deserialize `mimi` and make it an instance of `Cat`. Therefore I can't serialize it.
	assertThrows(
		() => seriall.purify(mimi),
		SeriallResolveFailedError,
	);

	// `mini` has a own property `meow`, it is a function.
	// This function is not provided in `values`, so it does not work.
	assertThrows(
		() => seriall.purify(mimi, { values: { Cat } }),
		SeriallResolveFailedError,
	);
});

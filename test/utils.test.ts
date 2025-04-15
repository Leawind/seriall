import { assert, assertFalse, assertStrictEquals, assertThrows } from '@std/assert';
import { seriall_sync as seriall } from '../src/index.ts';

Deno.test('Check if Symbol is global', () => {
	assert(seriall.utils.isGlobalSymbol(Symbol.for('global')));
	assertFalse(seriall.utils.isGlobalSymbol(Symbol('local')));

	assertFalse(seriall.utils.isGlobalSymbol(Symbol.iterator));
	assertFalse(seriall.utils.isGlobalSymbol(Symbol.asyncIterator));
});

Deno.test('Convert Symbol to string', () => {
	const s = Symbol();
	const mySymbol = Symbol('mySymbol');
	const yourSymbol = Symbol(6);

	assertStrictEquals(seriall.utils.symbolToString(s), `Symbol()`);
	assertStrictEquals(seriall.utils.symbolToString(mySymbol), `Symbol("mySymbol")`);
	assertStrictEquals(seriall.utils.symbolToString(yourSymbol), `Symbol("6")`);
});

Deno.test('Check if value looks like a prototype', () => {
	class Dad {}
	class Son extends Dad {}
	class Gon extends Son {}

	const dad = new Dad();
	const son = new Son();
	const gon = new Gon();

	[
		...[Dad.prototype, Son.prototype, Gon.prototype],
		Object.prototype,
		Function.prototype,
		Array.prototype,
		Boolean.prototype,
		Number.prototype,
	].forEach((v) => assert(seriall.utils.looksLikePrototype(v)));

	[
		gon.constructor,
		...[Dad, Son, Gon, Object, Function, Array, Boolean, Number],
		...[dad, son, gon],
		...[undefined, null, 123, 'str', false],
		...[Math, JSON],
		[],
		{},
		() => {},
		function named() {},
	].forEach((v) => assertFalse(seriall.utils.looksLikePrototype(v)));
});

Deno.test('Check if value looks like a class', () => {
	class Animal {}
	class Dog extends Animal {}

	[
		Animal,
		Dog,

		Function,
		Object,
		Array,
		Number,
		Boolean,
		Int8Array,
		ArrayBuffer,
	].forEach((v) => assert(seriall.utils.looksLikeClass(v)));

	[
		Animal.prototype,
		Dog.prototype,
		new Animal(),
		new Dog(),

		Function.prototype,
		Object.prototype,
		Array.prototype,
		Number.prototype,
		Boolean.prototype,
		Int8Array.prototype,
		ArrayBuffer.prototype,

		1324,
		1324,
		false,
		NaN,
		'Hello',
		null,
		undefined,

		Math,
		JSON,
		setInterval,
		clearInterval,
	].forEach((v) => assertFalse(seriall.utils.looksLikeClass(v)));
});

Deno.test('Get class with superclasses', () => {
	class A {}
	class B extends A {}
	class C extends B {}

	const supers = seriall.utils.withSupers(C);
	assertStrictEquals(supers.C, C);
	assertStrictEquals(supers.B, B);
	assertStrictEquals(supers.A, A);

	const emptyResult = seriall.utils.withSupers(Object);
	assertStrictEquals(emptyResult.Object, Object);
});

Deno.test('Clone pure functions', () => {
	function average(a: number, b: number) {
		const sum = a + b;
		return sum / 2;
	}

	const anonymousAvg = function (a: number, b: number) {
		const sum = a + b;
		return sum / 2;
	};

	const lambdaAvgWithBody = (a: number, b: number) => {
		const sum = a + b;
		return sum / 2;
	};

	const lambdaAvg = (a: number, b: number) => (a + b) / 2;

	[average, anonymousAvg, lambdaAvgWithBody, lambdaAvg].forEach((avg) => {
		const cloned = seriall.utils.clonePureFunction(avg);
		[
			[1, 2],
			[6, 3],
			[12, 423],
			[43412, -412423],
		].forEach(([a, b]) => {
			assertStrictEquals(
				avg(a, b),
				cloned(a, b),
			);

			assertStrictEquals(avg.length, cloned.length);
			assertStrictEquals(avg.prototype, cloned.prototype);

			// assertStrictEquals(avg.name, cloned.name);
			// assertStrictEquals(avg.toString(), cloned.toString());
		});
	});
});

Deno.test('Purify object with class hierarchy', () => {
	class A {}
	class B extends A {}
	class C extends B {}

	const original = {
		a: new A(),
		b: new B(),
		c: new C(),
	};

	assertThrows(
		() => seriall.purify(original, { palette: { C } }),
		seriall.SeriallResolveFailedError,
	);
	seriall.purify(original, { palette: { A, B, C } });
	seriall.purify(original, { palette: { ...seriall.utils.withSupers(C) } });
	seriall.purify(original, { palette: seriall.utils.withSupers(C) });

	const cloned = seriall.deepClone(original, { palette: seriall.utils.withSupers(C) });

	assert(cloned.a instanceof A);
	assert(cloned.b instanceof B);
	assert(cloned.c instanceof C);
});

Deno.test('Stringify and parse object in various formats', () => {
	const obj = { a: 1, b: 'test', c: [1, 2, 3] };

	// JSON
	const jsonString = seriall.stringify(obj, { format: 'json' });
	const parsedJson = seriall.parse(jsonString, { format: 'json' });
	assertStrictEquals(JSON.stringify(parsedJson), JSON.stringify(obj));

	// TOML
	const tomlString = seriall.stringify(obj, { format: 'toml' });
	console.log(tomlString);
	const parsedToml = seriall.parse(tomlString, { format: 'toml' });
	assertStrictEquals(JSON.stringify(parsedToml), JSON.stringify(obj));

	// YAML
	const yamlString = seriall.stringify(obj, { format: 'yaml' });
	const parsedYaml = seriall.parse(yamlString, { format: 'yaml' });
	assertStrictEquals(JSON.stringify(parsedYaml), JSON.stringify(obj));
});

import {
	assert,
	assertFalse,
	assertStrictEquals,
	assertThrows,
} from '@std/assert';
import {
	clonePureFunction,
	isGlobalSymbol,
	looksLikeClass,
	looksLikePrototype,
	symbolToString,
	withSupers,
} from '@/seriall/utils.ts';
import * as seriall from '@/mod.ts';

Deno.test(function testBiMap() {
	const bm = new seriall.BiMap<unknown, unknown>();

	// set
	bm.set('c', 299792458);
	bm.set('undef', undefined);
	bm.setAll({
		null: null,
		BiMap: seriall.BiMap,
	});
	bm.setMap(
		new Map([
			[false, 9000],
			[true, 9000],
		]),
	);
	bm.setPairs([
		[false, 5432],
		[true, 5432],
		[true, 9000],
	]);

	// get
	assertStrictEquals(bm.getValue('c'), 299792458);
	assertStrictEquals(bm.getKey(299792458), 'c');

	assertStrictEquals(bm.getValue('undef'), undefined);
	assertStrictEquals(bm.getKey(undefined), 'undef');

	assertStrictEquals(bm.getValue('null'), null);
	assertStrictEquals(bm.getKey(null), 'null');

	assertStrictEquals(bm.getValue('BiMap'), seriall.BiMap);
	assertStrictEquals(bm.getKey(seriall.BiMap), 'BiMap');

	assertFalse(bm.hasKey(false));
	assertFalse(bm.hasValue(5432));
	assertStrictEquals(bm.getValue(true), 9000);
	assertStrictEquals(bm.getKey(9000), true);

	// forEach
	bm.forEach((pair) => pair);

	// delete, has
	bm.deleteKey('undef');
	assertFalse(bm.hasKey('undefined'));
	assertFalse(bm.hasValue(undefined));

	bm.deleteValue(seriall.BiMap);
	assertFalse(bm.hasKey('BiMap'));
	assertFalse(bm.hasValue(seriall.BiMap));
});

Deno.test(function testIsGlobalSymbol() {
	assert(isGlobalSymbol(Symbol.for('global')));
	assertFalse(isGlobalSymbol(Symbol('local')));

	assertFalse(isGlobalSymbol(Symbol.iterator));
	assertFalse(isGlobalSymbol(Symbol.asyncIterator));
});

Deno.test(function testSymbolToString() {
	const s = Symbol();
	const mySymbol = Symbol('mySymbol');
	const yourSymbol = Symbol(6);

	assertStrictEquals(symbolToString(s), `Symbol()`);
	assertStrictEquals(symbolToString(mySymbol), `Symbol("mySymbol")`);
	assertStrictEquals(symbolToString(yourSymbol), `Symbol("6")`);
});
Deno.test(function testIsPrototype() {
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
	].forEach((v) => assert(looksLikePrototype(v)));

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
	].forEach((v) => assertFalse(looksLikePrototype(v)));
});

Deno.test(function testIsClass() {
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
	].forEach((v) => assert(looksLikeClass(v)));

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
	].forEach((v) => assertFalse(looksLikeClass(v)));
});

Deno.test(function testWithSupers() {
	class A {}
	class B extends A {}
	class C extends B {}

	const supers = withSupers(C);
	assertStrictEquals(supers.C, C);
	assertStrictEquals(supers.B, B);
	assertStrictEquals(supers.A, A);

	const emptyResult = withSupers(Object);
	assertStrictEquals(emptyResult.Object, Object);
});

Deno.test(function testClonePureFunction() {
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
		const cloned = clonePureFunction(avg);
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

Deno.test(function testWithSupers() {
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
	seriall.purify(original, { palette: { ...withSupers(C) } });
	seriall.purify(original, { palette: withSupers(C) });

	const cloned = seriall.deepClone(original, { palette: withSupers(C) });

	assert(cloned.a instanceof A);
	assert(cloned.b instanceof B);
	assert(cloned.c instanceof C);
});

import { assertStrictEquals, assertThrows } from '@std/assert';

Deno.test(function basicTest() {
	class Dog {
		private name: string;
		constructor(name: string) {
			this.name = name;
		}
		public setName(name: string): this {
			this.name = name;
			return this;
		}
		public getName(): string {
			return this.name;
		}
	}
	const wangcai = new Dog('wangcai');

	const cloned: Dog = Object.create(Dog.prototype);
	Object.defineProperty(cloned, 'name', {
		value: 'wangcai',
		enumerable: true,
		writable: true,
	});

	assertStrictEquals(wangcai.getName(), cloned.getName());
	wangcai.setName('dahuang');
	cloned.setName('dahuang');
	assertStrictEquals(wangcai.getName(), cloned.getName());
});

Deno.test(function nativeTest() {
	const fakeSet = Object.create(Set.prototype);

	// `TypeError: Method Set.prototype.add called on incompatible receiver #<Set>`
	//
	// The exception is thrown because `c` is not an instance of Set.
	// It only inherits the prototype of Set, but it does not have the internal
	// properties that a Set instance should have.
	// The only way to create a Set instance is `new Set()`
	assertThrows(() => fakeSet.add('hello'), TypeError);
});

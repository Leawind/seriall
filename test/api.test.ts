import * as seriall from '@/mod.ts';

Deno.test('test-api', async (t) => {
	await t.step('stringify, parse', () => {
		class A {}
		class B extends A {}
		const context_ab: seriall.ContextLike = {
			palette: { A, B },
		};

		const b = new B();
		const serialized_b = seriall.stringify(b, context_ab);
		const cloned_b = seriall.parse(serialized_b, context_ab);

		console.log(cloned_b);
	});
	await t.step('adapter', () => {
		class C {
			id: number;
			constructor(id: number) {
				this.id = id;
			}
		}
		const CAdapter: seriall.Adapter<C, number> = {
			serialize: (c) => c.id,
			deserialize: (id) => new C(id),
		};
		const context_c: seriall.ContextLike = {
			palette: { C },
			adapters: { CAdapter },
		};

		const c = new C(12138);
		const serialized_c = seriall.stringify(c, context_c);
		const cloned_c = seriall.parse(serialized_c, context_c);
		console.log(cloned_c);
	});
});

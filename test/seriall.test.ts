import { assert, assertStrictEquals, assertThrows } from '@std/assert'
import { seriall_sync as seriall } from '../src/index.ts'

Deno.test('Deep clone raw values', () => {
  ;['Hello world!', 12138, false, true, null]
    .forEach((v) => assertStrictEquals(seriall.deepClone(v), v))
})

Deno.test('Deep clone special values', () => {
  ;[NaN, Infinity, -Infinity, undefined, 141592653589793238462643383279502884n]
    .forEach((v) => assertStrictEquals(seriall.deepClone(v), v))
})

Deno.test('Deep clone Symbol values', () => {
  const globalSymbol = Symbol.for('F')

  const clonedF = seriall.deepClone(globalSymbol)
  assert(globalSymbol === clonedF)

  const mySymbol = Symbol('mine')

  assertThrows(
    () => seriall.purify(mySymbol),
    seriall.SeriallResolveFailedError,
  )
})

Deno.test('Deep clone arrays', () => {
  // flat array
  const array = [1, 2, 3]
  const arrayCloned = seriall.deepClone(array)

  assertStrictEquals(
    seriall.stringify(array),
    seriall.stringify(arrayCloned),
  )

  // deep array
  const deepArray = [
    [1, 4, 1],
    [4, 8, 4],
    [1, 4, 1],
  ]
  assertStrictEquals(
    seriall.stringify(deepArray),
    seriall.stringify(
      seriall.deepClone(seriall.deepClone(deepArray)),
    ),
  )

  // diverse array
  const diverseArray = [
    'Hello world!',
    3.141592653589793,
    false,
    [null, 299792458n, undefined],
    [[[[]]]],
  ]
  assertStrictEquals(
    seriall.stringify(diverseArray),
    seriall.stringify(
      seriall.deepClone(seriall.deepClone(diverseArray)),
    ),
  )
})

Deno.test('Deep clone with reference values', () => {
  const mySymbol = Symbol('My Symbol')
  const options: seriall.ContextLike = { palette: { mySymbol } }
  assertStrictEquals(
    seriall.stringify(mySymbol, options),
    seriall.stringify(
      seriall.deepClone(mySymbol, options),
      options,
    ),
  )
})

Deno.test('Deep clone prototypes', () => {
  class A {}
  class B extends A {}
  class C extends B {}
  const options: seriall.ContextLike = { palette: { A, B, C } }
  ;[
    Function.prototype,
    Object.prototype,
    Array.prototype,
    String.prototype,
    Boolean.prototype,
    Number.prototype,
    BigInt.prototype,

    Date.prototype,
    ArrayBuffer.prototype,
    DataView.prototype,
    Int8Array.prototype,

    A.prototype,
    B.prototype,
    C.prototype,
  ].forEach((proto) =>
    assertStrictEquals(
      seriall.stringify(proto, options),
      seriall.stringify(
        seriall.deepClone(proto, options),
        options,
      ),
    )
  )
})

Deno.test('Deep clone objects with various types', () => {
  const original = {
    raw: [0, 1234, 'hello world', false, true, null],
    special: [undefined, 1n],
    inf: [Infinity, -Infinity, NaN],
    protos: [Function.prototype, Object.prototype, String.prototype],
    native: [Math, JSON, atob, crypto, Symbol],
    arr: [[[[]]]],
  }
  assertStrictEquals(
    seriall.stringify(original),
    seriall.stringify(seriall.deepClone(original)),
  )
})

Deno.test('Deep clone with custom adapter', () => {
  class A {
    constructor(public value: string) {}
  }

  const options: seriall.ContextLike = {
    adapters: {
      [A.name]: {
        serialize: (obj: A) => obj.value,
        deserialize: (pure: string) => new A(pure),
      },
    },
  }

  const original = new A('test')

  // const _pures = ['test', { type: 7, name: 'CustomClass', value: 0 }];

  const cloned = seriall.deepClone(original, options)
  assertStrictEquals(original.value, cloned.value)
  assertStrictEquals(
    seriall.stringify(original, options),
    seriall.stringify(cloned, options),
  )
})

Deno.test('Deep clone object with same references', () => {
  const wangcai = {
    name: 'Wangcai',
    age: 7,
  }
  const original = {
    left: wangcai,
    right: wangcai,
  }

  const cloned = seriall.deepClone(original)

  assert(original.left === original.right)
  assert(cloned.left === cloned.right)
})

Deno.test('Deep clone self-referencing object', () => {
  type Reference<T> = { ref?: T }

  const original: Reference<unknown> = {}
  original.ref = original

  assert(original === original.ref)
  const cloned = seriall.deepClone(original)
  assert(cloned === cloned.ref)
})

Deno.test('Deep clone circular references', () => {
  type Reference<T> = { ref?: T }

  const a: Reference<unknown> = {}
  const b: Reference<unknown> = {}
  const c: Reference<unknown> = {}

  a.ref = b
  b.ref = c
  c.ref = a

  const original = { a, b, c }

  const cloned = seriall.deepClone(original)

  assertStrictEquals(cloned.a.ref, cloned.b)
  assertStrictEquals(cloned.b.ref, cloned.c)
})

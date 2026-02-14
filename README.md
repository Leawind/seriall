# Seriall

[![GitHub License](https://img.shields.io/github/license/Leawind/seriall)]()
[![JSR Version](https://img.shields.io/jsr/v/%40leawind/seriall?logo=JSR)](https://jsr.io/@leawind/seriall)
[![deno doc](https://doc.deno.land/badge.svg)](https://jsr.io/@leawind/seriall)
[![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/Leawind/seriall/deno-test.yaml?branch=main&logo=github-actions&label=test)](https://github.com/Leawind/seriall/actions/workflows/deno-test.yaml)

**Seriall** is s simple serialization library for JavaScript / TypeScript, supports circular references and built-in types

| Value               | Serialized                                               |
| ------------------- | -------------------------------------------------------- |
| `12138`             | `[12138]`                                                |
| `true`              | `[true]`                                                 |
| `16n`               | `[{T:3,V:"16"}]`                                         |
| `[80, 'http']`      | `[[1,2],80,"http"]`                                      |
| `Math`              | `[{T:7,K:"Math"}]`                                       |
| `new Set()`         | `[{T:8,N:"Set",V:1},[]]`                                 |
| `{ name: 'Steve' }` | `[{T:6,C:1,P:[["name",2,{}]]},{T:7,K:"Object"},"Steve"]` |

## Features

- **Supports built-in types** (e.g., `Map`, `Date`, `ArrayBuffer`, `Uint8Array`)
- **Supports circular references**
- **Serializable custom class instances**
- **Deep cloning capability**

## Installation

|          |                                     |
| -------- | ----------------------------------- |
| **deno** | `deno add jsr:@leawind/seriall`     |
| **npm**  | `npx jsr add @leawind/seriall`      |
| **yarn** | `yarn dlx jsr add @leawind/seriall` |
| **pnpm** | `pnpm dlx jsr add @leawind/seriall` |
| **bun**  | `bunx jsr add @leawind/seriall`     |

## Usage

Import **seriall**

```ts
import { seriall_sync as seriall } from '@leawind/seriall'
```

### Serialize

Stringify an object

```ts
seriall.stringify<T>(obj: T, options: SeriallOptions = {}): string;
```

### Deserialize

Parse a string and get the object:

```ts
seriall.parse<T>(str: string, options: SeriallOptions = {}): T;
```

### Deep clone

Deep clone an object. This function serialize the given object and then deserialize it.

```ts
seriall.deepClone<T>(obj: T, options: SeriallOptions = {}): T;
```

## Examples

### Simple value

```ts
const alice = { name: '' }
const json = seriall.stringify(alice)
const dolly = seriall.parse<typeof alice>(json)

assert(alice.name === dolly.name)
```

### Instance of bulit-in Class

```typescript
const original = {
  array: [2, 3, 4],
  set: new Set([12138, 7355608]),
  map: new Map(Object.entries({ greet: 'hello world' })),
  typed_array: new Int8Array([7, 6, 5, 4, 3]),
}

// deepClone means serialize and then deserialize
const cloned = seriall.deepClone(original)

assert(cloned.array.length === 3)
assert(cloned.set.has(12138))
assert(cloned.map.has('greet'))
assert(cloned.typed_array[2] === 5)
```

### Instance of custom Class

```ts
class Cat {}
const mimi = new Cat()

// `mimi` is an instance of `Cat`, which is a custom Class.
// If you don't tell it how to get `Cat`, it won't be able to deserialize `mimi` and make it an instance of `Cat`. Therefore it refuses to serialize it.
assertThrows(() => seriall.purify(mimi), seriall.SeriallResolveFailedError)

// The second argument is telling seriall how to find class `Cat`: just by name "Cat"
const pure = seriall.purify(mimi, { palette: { Cat: Cat } })
console.debug(`mimi: `, pure)
// Output:  [ { T: 6, C: 1, P: [] }, { T: 7, K:"Cat" } ]

// It will be able to find constructor `Cat` and its prototype object by name "Cat" when deserializing.
const clonedMimi = seriall.parse(pure, { palette: { Cat } })
assert(clonedMimi instanceof Cat)
```

## Builtin adapters

You may have noticed this in previous example about built-in class instance. Some types like `Map`, `Date`, `Int8Array` have their internal properties, they can't be simply described like regular object (for example: `{name: 'Steve'}`). So I have made some adapters for them.

These are supported builtin adapters.

- `Number` `String` `Boolean`
- `Map` `Set`
- `Date` `RegExp` `URL` `URLSearchParams` `URLPattern`
- `ArrayBuffer` `DataView`
- `Uint8Array` `Uint8ClampedArray` `Int8Array` `Uint16Array` `Int16Array` `Uint32Array` `Int32Array` `Float16Array` `Float32Array` `Float64Array` `BigUint64Array` `BigInt64Array`
- `ImageData` `ByteLengthQueuingStrategy` `Headers`

The implementation of those built-in adapters are at `src/seriall/builtin/adapters.ts`. You can also implement adapter for your custom Class.

## Limitations

- **Added properties on special instances**\
  Manually added properties to arrays or any class instances with adapters (e.g., `Map`, `Date`, `ArrayBuffer`) will be **silently dropped**.\
  Example:

  ```ts
  const arr = [1, 2]
  arr.customProp = 'value' // ❌ Won't survive serialization
  ```

- **No field filtering**\
  All string-keyed own properties are serialized by default. Custom selection of serializable fields is not supported.

- **Symbol-keyed properties**\
  Properties with `Symbol` keys will be **ignored** during serialization.

- **JavaScript/TypeScript only**\
  Currently lacks cross-language support. Serialized data can only be deserialized in JavaScript/TypeScript environments.

import type {
	SeriallAdapter,
	SeriallAdapters,
} from '@/seriall/core/context.ts';
import type { PureIndex } from '@/seriall/core/pure.ts';

function typed<A, B>(adapter: SeriallAdapter<A, B>) {
	return adapter;
}

export const BUILTIN_ADAPTERS: SeriallAdapters = new Map([
	// Primitives
	...[Number, String, Boolean]
		.map<[string, SeriallAdapter<unknown, unknown>]>((clazz) => [
			clazz.name,
			typed({
				serialize: (obj: object) => obj.valueOf(),
				deserialize: (pure: number) => new clazz(pure),
			}),
		]),

	...Object.entries({
		[Set.name]: typed({
			serialize: (obj: Set<unknown>) => Array.from(obj),
			deserialize: (pure: PureIndex[]) => new Set(pure),
		}),
		[Map.name]: typed({
			serialize: (obj: Map<unknown, unknown>) =>
				Array.from(
					obj.entries()
						.map<[unknown, unknown]>(
							([key, value]) => [key, value],
						),
				),
			deserialize: (pure: [PureIndex, PureIndex][]) =>
				new Map(pure.map(([kid, vid]) => [kid, vid])),
		}),

		[Date.name]: typed({
			serialize: (obj: Date) => obj.valueOf(),
			deserialize: (pure: number) => new Date(pure),
		}),
		[RegExp.name]: typed({
			serialize: (obj: RegExp) => ({
				src: obj.source,
				flags: obj.flags,
			}),
			deserialize: (pure) => new RegExp(pure.src, pure.flags),
		}),
		[URL.name]: typed({
			serialize: (obj: URL) => obj.href,
			deserialize: (pure: string) => new URL(pure),
		}),
		[URLSearchParams.name]: typed({
			serialize: (obj: URLSearchParams) => Array.from(obj.entries()),
			deserialize: (pure: [string, string][]) =>
				new URLSearchParams(pure),
		}),
		[URLPattern.name]: typed({
			serialize: (obj: URLPattern) => ({
				P: obj.protocol,
				U: obj.username,
				pwd: obj.password,
				host: obj.hostname,
				port: obj.port,
				pth: obj.pathname,
				S: obj.search,
				hash: obj.hash,
			}),
			deserialize: (pure) =>
				new URLPattern({
					protocol: pure.P,
					username: pure.U,
					password: pure.pwd,
					hostname: pure.host,
					port: pure.port,
					pathname: pure.pth,
					search: pure.S,
					hash: pure.hash,
				}),
		}),
		[ArrayBuffer.name]: typed({
			serialize: (obj: ArrayBuffer) => {
				const arr = new Uint8Array(obj);
				const chunkSize = 32768;
				let bin = '';

				for (let i = 0; i < arr.length; i += chunkSize) {
					const chunk = arr.subarray(i, i + chunkSize);
					bin += String.fromCharCode.apply(
						null,
						chunk as unknown as number[],
					);
				}

				return btoa(bin);
			},
			deserialize: (pure: string) => {
				const bin = atob(pure);
				const arr = new Uint8Array(bin.length);
				for (let i = 0; i < bin.length; i++) {
					arr[i] = bin.charCodeAt(i);
				}
				return arr.buffer;
			},
		}),
		[DataView.name]: typed({
			serialize: (obj: DataView) => ({
				buf: obj.buffer,
				off: obj.byteOffset,
				len: obj.byteLength,
			}),
			deserialize: (pure: {
				buf: ArrayBuffer;
				off: number;
				len: number;
			}) => new DataView(pure.buf, pure.off, pure.len),
		}),
		[ByteLengthQueuingStrategy.name]: typed({
			serialize: (obj: ByteLengthQueuingStrategy) => ({
				hwm: obj.highWaterMark,
			}),
			deserialize: (pure: { hwm: number }) =>
				new ByteLengthQueuingStrategy({ highWaterMark: pure.hwm }),
		}),
	}),

	// Typed Arrays
	...[
		Uint8ClampedArray,
		Uint8Array,
		Int8Array,

		Uint16Array,
		Int16Array,
		Float16Array,

		Uint32Array,
		Int32Array,
		Float32Array,

		Float64Array,
		BigUint64Array,
		BigInt64Array,
	].map<[string, SeriallAdapter<unknown, unknown>]>((clazz) => [
		clazz.name,
		typed({
			serialize: (obj) => obj.buffer, // instanceof ArrayBuffer
			deserialize: (buffer: ArrayBuffer) => new clazz(buffer),
		}),
	]),

	// Unserializable
	...[
		Blob,
		File,
		FinalizationRegistry,
		AbortController,
		AbortSignal,
		Proxy,
		Promise,
		WebSocket,
		Worker,
		SharedArrayBuffer,
		Iterator,
		ImageBitmap,
		Window,
		Navigator,
		Request,
		Response,
		...[
			CloseEvent,
			ErrorEvent,
			Event,
			MessageEvent,
			CustomEvent,
			PromiseRejectionEvent,
			ProgressEvent,
		],
		...[WeakMap, WeakSet, WeakRef],
		...[
			Error,
			AggregateError,
			EvalError,
			RangeError,
			ReferenceError,
			SyntaxError,
			TypeError,
			URIError,
		],
	].map<[string, SeriallAdapter<unknown, unknown>]>((clazz) => [
		clazz.name,
		typed({
			serialize: () => {
				throw new Error(`Type ${clazz.name} cannot be serialized.`);
			},
			deserialize: () => undefined,
		}),
	]),
]);

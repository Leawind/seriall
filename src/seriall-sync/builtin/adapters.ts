import type { PureIndex } from '../../seriall/core/pure.ts';
import { BUILTIN_PALETTE } from '../../seriall/builtin/palette.ts';

import type { AdapterSync, ContextAdaptersSync } from '../core/context.ts';

export function typed<A, B>(adapter: AdapterSync<A, B>): AdapterSync<A, B> {
	return adapter;
}

/**
 * Adapters for some commonly-used built-in types
 */
export const BUILTIN_ADAPTERS_SYNC: ContextAdaptersSync = new Map([
	// Primitives
	...[Number, String, Boolean]
		.map<[string, AdapterSync<unknown, unknown>]>((clazz) => [
			clazz.name,
			typed({
				serialize: (obj: object) => obj.valueOf(),
				deserialize: (pure: number) => new clazz(pure),
			}),
		]),

	...Object.entries({
		Set: typed({
			serialize: (obj: Set<unknown>) => Array.from(obj),
			deserialize: (pure: PureIndex[]) => new Set(pure),
		}),
		Map: typed({
			serialize: (obj: Map<unknown, unknown>) =>
				Array.from(
					obj.entries()
						.map<[unknown, unknown]>(([key, value]) => [key, value]),
				),
			deserialize: (pure: [PureIndex, PureIndex][]) => new Map(pure.map(([kid, vid]) => [kid, vid])),
		}),

		Date: typed({
			serialize: (obj: Date) => obj.valueOf(),
			deserialize: (pure: number) => new Date(pure),
		}),
		RegExp: typed({
			serialize: (obj: RegExp) => ({
				src: obj.source,
				flags: obj.flags,
			}),
			deserialize: (pure) => new RegExp(pure.src, pure.flags),
		}),
		URL: typed({
			serialize: (obj: URL) => obj.href,
			deserialize: (pure: string) => new URL(pure),
		}),
		URLSearchParams: typed({
			serialize: (obj: URLSearchParams) => Array.from(obj.entries()),
			deserialize: (pure: [string, string][]) => new URLSearchParams(pure),
		}),
		URLPattern: typed({
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
		ArrayBuffer: typed({
			serialize: (obj: ArrayBuffer) => {
				const arr = new Uint8Array(obj);
				const chunkSize = 32768;
				let bytes = '';

				for (let i = 0; i < arr.length; i += chunkSize) {
					const chunk = arr.subarray(i, i + chunkSize);
					bytes += String.fromCharCode.apply(
						null,
						chunk as unknown as number[],
					);
				}

				return bytes;
			},
			deserialize: (pure: string) => {
				const arr = new Uint8Array(pure.length);
				for (let i = 0; i < pure.length; i++) {
					arr[i] = pure.charCodeAt(i);
				}
				return arr.buffer;
			},
		}),
		DataView: typed({
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
		ByteLengthQueuingStrategy: typed({
			serialize: (obj: ByteLengthQueuingStrategy) => ({ hwm: obj.highWaterMark }),
			deserialize: (pure: { hwm: number }) => new ByteLengthQueuingStrategy({ highWaterMark: pure.hwm }),
		}),
		ImageData: typed({
			serialize: (obj: ImageData) => ({
				d: obj.data.buffer,
				w: obj.width,
				h: obj.height,
			}),
			deserialize: (pure: {
				d: ArrayBuffer;
				w: number;
				h: number;
			}) =>
				new ImageData(
					new Uint8ClampedArray(pure.d),
					pure.w,
					pure.h,
				),
		}),
		Headers: typed({
			serialize: (obj: Headers) => Array.from(obj),
			deserialize: (pure: [string, string][]) => new Headers(pure),
		}),
	}),

	// Typed Arrays
	...[
		'Uint8ClampedArray',
		'Uint8Array',
		'Int8Array',
		'Uint16Array',
		'Int16Array',
		'Float16Array',
		'Uint32Array',
		'Int32Array',
		'Float32Array',
		'Float64Array',
		'BigUint64Array',
		'BigInt64Array',
	].map<[string, AdapterSync<unknown, unknown>]>((name) => [
		name,
		typed({
			serialize: (obj: Int8Array) => obj.buffer, // instanceof ArrayBuffer
			deserialize: (buffer: ArrayBuffer) => new (BUILTIN_PALETTE.getValue<typeof Int8Array>(name)!)(buffer),
		}),
	]),

	// Unserializable
	...[
		'Blob',
		'File',
		'FinalizationRegistry',
		'AbortController',
		'AbortSignal',
		'Proxy',
		'Promise',
		'WebSocket',
		'Worker',
		'SharedArrayBuffer',
		'Iterator',
		'ImageBitmap',
		'Window',
		'Navigator',
		'Request',
		'Response',
		...[
			'CloseEvent',
			'ErrorEvent',
			'Event',
			'MessageEvent',
			'CustomEvent',
			'PromiseRejectionEvent',
			'ProgressEvent',
		],
		...[
			'WeakMap',
			'WeakSet',
			'WeakRef',
		],
		...[
			'Error',
			'AggregateError',
			'EvalError',
			'RangeError',
			'ReferenceError',
			'SyntaxError',
			'TypeError',
			'URIError',
		],
	].map<[string, AdapterSync<unknown, unknown>]>((name) => [
		name,
		typed({
			serialize: () => {
				throw new Error(`Type ${name} cannot be serialized.`);
			},
			deserialize: () => undefined,
		}),
	]),
]);

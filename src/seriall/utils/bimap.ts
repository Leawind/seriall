/**
 * A BiMap (Bi-directional map) is a type of dictionary or hash table that holds key-value pairs and also maintains an inverse mapping from values to keys.
 * It allows efficient lookup by both keys and values.
 *
 * @template K - The type of the keys.
 * @template V - The type of the values.
 */
export class BiMap<K = unknown, V = unknown> {
	private key2value: Map<K, V> = new Map();
	private value2key: Map<V, K> = new Map();

	get size(): number {
		return this.key2value.size;
	}

	public clear(): this {
		this.key2value.clear();
		this.value2key.clear();
		return this;
	}

	public hasKey(key: K): boolean {
		return this.key2value.has(key);
	}
	public hasValue(value: V): boolean {
		return this.value2key.has(value);
	}

	public assertKey(key: K) {
		if (!this.hasKey(key)) {
			throw new BiMapNoSuchKeyError(key);
		}
	}
	public assertValue(value: V) {
		if (!this.hasValue(value)) {
			throw new BiMapNoSuchValueError(value);
		}
	}

	/**
	 * @returns true if an key in the BiMap existed and has been removed, or false if the key does not exist.
	 */
	public deleteKey(key: K): boolean {
		if (this.hasKey(key)) {
			this.value2key.delete(this.key2value.get(key)!);
			this.key2value.delete(key);
			return true;
		}
		return false;
	}

	/**
	 * @returns true if an value in the BiMap existed and has been removed, or false if the value does not exist.
	 */
	public deleteValue(value: V): boolean {
		if (this.hasValue(value)) {
			this.key2value.delete(this.value2key.get(value)!);
			this.value2key.delete(value);
			return true;
		}
		return false;
	}

	public deleteKeys(keys: K[]): this {
		let num = 0;
		for (const key of keys) {
			if (this.deleteKey(key)) {
				num++;
			}
		}
		return this;
	}

	public deleteValues(values: V[]): this {
		let num = 0;
		for (const value of values) {
			if (this.deleteValue(value)) {
				num++;
			}
		}
		return this;
	}

	/**
	 * Returns a value from the BiMap object. If the value that is associated to the provided key is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the BiMap.
	 *
	 * @returns Returns the value associated with the specified key
	 * @throws {BiMapNoSuchKeyError} Error is throwed if no value is associated with the specified key
	 */
	public getValue<v = V>(key: K): v {
		this.assertKey(key);
		return this.key2value.get(key) as v;
	}

	/**
	 * Returns a key from the BiMap object. If the key that is associated to the provided value is an object, then you will get a reference to that object and any change made to that object will effectively modify it inside the BiMap.
	 *
	 * @returns Returns the key associated with the specified value
	 * @throws {BiMapNoSuchValueError} Error is throwed if no key is associated with the specified value
	 */
	public getKey<k = K>(value: V): k {
		this.assertValue(value);
		return this.value2key.get(value) as k;
	}

	/**
	 * Adds a new pair of [key, value] to the BiMap.
	 *
	 * If any pair with the same key or value already exists, they will be removed.
	 */
	public set(key: K, value: V): this {
		if (this.hasKey(key)) {
			this.deleteKey(key);
		}
		if (this.hasValue(value)) {
			this.deleteValue(value);
		}
		this.key2value.set(key, value);
		this.value2key.set(value, key);
		return this;
	}

	/**
	 * Adds multiple pairs of [key, value] to the BiMap.
	 *
	 * If any pair with the same key or value already exists, they will be removed.
	 */
	public setAll(pairs: Record<string, V>): this {
		for (const [key, value] of Object.entries(pairs)) {
			this.set(key as K, value);
		}
		return this;
	}

	/**
	 * Adds multiple pairs of [key, value] to the BiMap.
	 *
	 * If any pair with the same key or value already exists, they will be removed.
	 */
	public setMap(pairs: Map<K, V>): this {
		for (const [key, value] of pairs.entries()) {
			this.set(key, value);
		}
		return this;
	}

	/**
	 * Adds multiple pairs of [key, value] to the BiMap.
	 *
	 * If any pair with the same key or value already exists, they will be removed.
	 */
	public setPairs(pairs: [K, V][]): this {
		for (const [key, value] of pairs) {
			this.set(key, value);
		}
		return this;
	}

	public add(key: K, value: V): this {
		if (this.hasKey(key)) {
			throw new BiMapKeyConflictError(key);
		} else if (this.hasValue(value)) {
			throw new BiMapValueConflictError(value);
		}
		this.key2value.set(key, value);
		this.value2key.set(value, key);
		return this;
	}

	public addAll(pairs: Record<string, V>): this {
		for (const [key, value] of Object.entries(pairs)) {
			this.add(key as K, value);
		}
		return this;
	}

	public addMap(pairs: Map<K, V>): this {
		for (const [key, value] of pairs.entries()) {
			this.add(key, value);
		}
		return this;
	}

	public addPairs(pairs: [K, V][]): this {
		for (const [key, value] of pairs) {
			this.add(key, value);
		}
		return this;
	}

	/**
	 * Returns an iterable of keys in the map
	 */
	public keys(): MapIterator<K> {
		return this.key2value.keys();
	}

	/**
	 * Returns an iterable of values in the map
	 */
	public values(): MapIterator<V> {
		return this.value2key.keys();
	}

	/**
	 * Returns an iterable of key, value pairs for every entry in the map.
	 */
	public entries(): MapIterator<[K, V]> {
		return this.key2value.entries();
	}

	/**
	 * Executes a provided function once per each key/value pair in the BiMap, in insertion order.
	 */
	public forEach(
		callbackfn: (
			pair: [key: K, value: V],
			bimap: BiMap<K, V>,
		) => void,
	) {
		this.key2value.forEach((value, key) => callbackfn([key, value], this));
	}

	public clone(): BiMap<K, V> {
		const cloned = new BiMap<K, V>();
		cloned.key2value = new Map(this.key2value);
		cloned.value2key = new Map(this.value2key);
		return cloned;
	}

	public static fromRecord<V = unknown>(
		pairs: Record<string, V>,
	): BiMap<string, V> {
		return new BiMap<string, V>().addAll(pairs);
	}
}

export class BiMapError extends Error {}
export class BiMapNoSuchKeyError<K> extends BiMapError {
	constructor(cause: K) {
		super(`No such key: ${cause}`, { cause });
	}
}
export class BiMapNoSuchValueError<V> extends BiMapError {
	constructor(cause: V) {
		super(`No such value: ${cause}`, { cause });
	}
}
export class BiMapKeyConflictError<K> extends BiMapError {
	constructor(cause: K) {
		super(`Key already exist: ${cause}`, { cause });
	}
}
export class BiMapValueConflictError<V> extends BiMapError {
	constructor(cause: V) {
		super(`Value already exist: ${cause}`, { cause });
	}
}

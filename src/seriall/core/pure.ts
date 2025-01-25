export enum PureType {
	Raw,
	Array,

	Symbol,
	BigInt,
	Special,

	Prototype,
	Object,

	/**
	 * Refer to a value in a `contexts[n].values`
	 */
	RefValue,
	/**
	 * Refer to an adapter in a `contexts[n].adapters`
	 */
	RefAdapter,
}
export enum PureKey {
	Type = 'T',
	Value = 'V',

	Class = 'C',
	Key = 'K',
	Name = 'N',
	Properties = 'P',

	// Descriptor
	Writable = 'W',
	Enumerable = 'E',
	Configurable = 'C',
}
export enum SpecialPureValue {
	Undefined,
	Nan,
	pInfinity,
	mInfinity,
}

/**
 * Index of a `SerialPure` in the array
 */
export type PureIndex = number;

export type PureRaw = string | number | boolean | null;
export type PureArray = PureIndex[];

export type PureSymbol = {
	[PureKey.Type]: PureType.Symbol;
	[PureKey.Key]: string;
};

export type PureBigint = {
	[PureKey.Type]: PureType.BigInt;
	[PureKey.Value]: string;
};

export type PureSpecial = {
	[PureKey.Type]: PureType.Special;
	[PureKey.Value]: SpecialPureValue;
};

export type PurePrototype = {
	[PureKey.Type]: PureType.Prototype;
	/**
	 * class
	 *
	 * index of `proto.constructor`
	 */
	[PureKey.Class]: PureIndex;
};

export type PureObject = {
	[PureKey.Type]: PureType.Object;
	/**
	 * class
	 *
	 * index of `obj.constructor`
	 */
	[PureKey.Class]: PureIndex;
	/**
	 * properties with value and descriptor
	 */
	[PureKey.Properties]: [key: string, value: PureIndex, descriptor: {
		[PureKey.Writable]?: boolean;
		[PureKey.Enumerable]?: boolean;
		[PureKey.Configurable]?: boolean;
	}][];
};

/**
 * Refer to a value in the context palette
 */
export type PureRefValue = {
	[PureKey.Type]: PureType.RefValue;
	[PureKey.Key]: string;
};
export type PureRefAdapter = {
	[PureKey.Type]: PureType.RefAdapter;
	[PureKey.Name]: string;
	[PureKey.Value]: PureIndex;
};

export type Pure =
	| PureRaw
	| PureArray
	| PureSymbol
	| PureBigint
	| PureSpecial
	| PurePrototype
	| PureObject
	| PureRefValue
	| PureRefAdapter;

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

export type SeriallPureRaw = string | number | boolean | null;
export type SeriallPureArray = PureIndex[];

export type SeriallPureSymbol = {
	[PureKey.Type]: PureType.Symbol;
	[PureKey.Key]: string;
};

export type SeriallPureBigint = {
	[PureKey.Type]: PureType.BigInt;
	[PureKey.Value]: string;
};

export type SeriallPureSpecial = {
	[PureKey.Type]: PureType.Special;
	[PureKey.Value]: SpecialPureValue;
};

export type SeriallPurePrototype = {
	[PureKey.Type]: PureType.Prototype;
	/**
	 * class
	 *
	 * index of `proto.constructor`
	 */
	[PureKey.Class]: PureIndex;
};

export type SeriallPureObject = {
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

export type SeriallPureRefValue = {
	[PureKey.Type]: PureType.RefValue;
	/**
	 * key
	 *
	 * value key in the context
	 */
	[PureKey.Key]: string;
};
export type SeriallPureRefAdapter = {
	[PureKey.Type]: PureType.RefAdapter;
	[PureKey.Name]: string;
	[PureKey.Value]: PureIndex;
};

export type SeriallPure =
	| SeriallPureRaw
	| SeriallPureArray
	| SeriallPureSymbol
	| SeriallPureBigint
	| SeriallPureSpecial
	| SeriallPurePrototype
	| SeriallPureObject
	| SeriallPureRefValue
	| SeriallPureRefAdapter;

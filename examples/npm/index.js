import { seriall_sync as seriall } from "@leawind/seriall";

class A {
	id;
	constructor(id) {
		this.id = id;
	}
}

const context = { palette: { A } };

const a = new A(1234);

const str = seriall.stringify(a, context);

console.log(str);

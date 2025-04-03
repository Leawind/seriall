import { seriall_sync as seriall } from "@leawind/seriall";

class A {
  private id: number;
  public constructor(id: number) {
    this.id = id;
  }
}

const context: seriall.ContextLike = { palette: { A } };

const a = new A(1234);

const str = seriall.stringify(a, context);

console.log(str);

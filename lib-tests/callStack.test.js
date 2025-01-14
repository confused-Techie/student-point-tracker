const CallStack = require("../lib/callStack.js");

describe("callstack", () => {
  let callStack;

  beforeAll(() => {
    callStack = new CallStack();
  })

  test("initializes properly", () => {
    expect(callStack.calls.init).toBeDefined();
    expect(callStack.calls.init.time).toBeDefined();
  });

  test("adds strings without issue", () => {
    callStack.addCall("string", "Hello World");

    expect(callStack.calls.string).toBeDefined();
    expect(callStack.calls.string.content).toBe("Hello World");
    expect(callStack.calls.string.time).toBeDefined();
  });

  test("adds objects without issue", () => {
    callStack.addCall("object", { key: "value" });
    console.log(callStack);
    expect(callStack.calls.object).toBeDefined();
    expect(callStack.calls.object.content.key).toBe("value");
    expect(callStack.calls.object.time).toBeDefined();
  });

  test("filters object data being added", () => {
    callStack.addCall("filtered.object", { key: "value", password: "super secret password" });

    expect(callStack.calls["filtered.object"]).toBeDefined();
    expect(callStack.calls["filtered.object"].content.key).toBe("value");
    expect(callStack.calls["filtered.object"].content.password).toBe("*****");
    expect(callStack.calls["filtered.object"].time).toBeDefined();
  });
});

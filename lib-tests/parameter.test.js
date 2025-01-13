const parameters = require("../lib/webServer/parameters.js");

describe("parameters", () => {

  const spec = [
    {
      name: "token",
      in: "query",
      description: "Some text",
      "x-parse": (value, _spec) => {
        return value;
      }
    },
    {
      name: "number",
      in: "query",
      schema: {
        type: "number",
        minimum: 2
      },
      "x-parse": (value, spec) => {
        const conv = Number.parseInt(value);
        if (conv < spec.schema.minimum) {
          return spec.schema.minimum;
        } else {
          return conv;
        }
      }
    }
  ];

  test("initializes parameters properly", () => {
    const parameterList = parameters(spec);

    expect(parameterList.token).toBeDefined();
    expect(parameterList.number).toBeDefined();
    expect(parameterList.number.spec).toBeDefined();
  });

  test("runs 'x-parse' functions with the correct value", () => {
    const req = { query: { token: "hello-world" }};

    const parameterList = parameters(spec);
    parameterList.token.initialize(req);
    const token = parameterList.token.parse();

    expect(token).toBeTypeof("string");
    expect(token).toBe("hello-world");
  });
});

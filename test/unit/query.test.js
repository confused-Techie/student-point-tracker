const query = require("../../src/query_parameters/_export.js").query;

describe("Verify query.id() returns", () => {
  const req = {
    params: { id: "12" },
  };

  const res = query.id(req);

  expect(res).toBe("12");
});

describe("Verify query.query() returns", () => {
  const queryCases = [
    [{ query: { q: "search-term" } }, "search-term"],
    [{ query: {} }, ""],
    [{ query: { q: "../your-secret.env" } }, ""],
  ];

  test.each(queryCases)("Given %o Returns %p", (arg, result) => {
    expect(query.query(arg)).toBe(result);
  });
});

describe("Verify query.points() returns", () => {
  const pointsCases = [
    [{ query: { points: "3" } }, 3],
    [{ query: {} }, 0],
    [{ query: { points: "2" } }, 2],
    [{ query: { points: "JustText" } }, 0],
    [{ query: { points: undefined } }, 0],
    [{ query: { points: 4 } }, 4],
  ];

  test.each(pointsCases)("Given %o Returns %p", (arg, result) => {
    expect(query.points(arg)).toBe(result);
  });
});

describe("Verify query.reason() returns", () => {
  const reasonCases = [
    [{ query: { reason: "Reason Text" } }, "Reason Text"],
    [{ query: {} }, ""],
    [{ query: { reason: "../your-secret.env" } }, ""],
  ];

  test.each(reasonCases)("Given %o Returns %p", (arg, result) => {
    expect(query.reason(arg)).toBe(result);
  });
});

describe("Verify query.page() returns", () => {
  const pageCases = [
    [{ query: { page: "3" } }, 3],
    [{ query: {} }, 1],
    [{ query: { page: "2" } }, 2],
    [{ query: { page: "JustText" } }, 1],
    [{ query: { page: undefined } }, 1],
    [{ query: { page: 4 } }, 4],
  ];

  test.each(pageCases)("Given %o Returns %p", (arg, result) => {
    expect(query.page(arg)).toBe(result);
  });
});

describe("Verify query.user() returns", () => {
  // User is special as it isn't really a query paramter.
  // But it's a value we pass through the request object to ensure propogation
  const userCases = [
    [{ user: { hello: "world" } }, { hello: "world" }],
    [{ user: "hello_world" }, {}],
  ];

  test.each(userCases)("Give %o Retrns %p", (arg, result) => {
    expect(query.user(arg)).toMatchObject(result);
  });
});

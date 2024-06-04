const endpoint = require("../../src/controllers/getStudentId.js");
const context = require("../../src/context.js");
const Res = require("../helpers/res.js");

describe("if student doesn't exist", () => {
  test("returns error page", async () => {
    let res = new Res();
    const endRes = await endpoint.logic({ params: {} }, res, context);
    console.log(res);
  });
});

const endpoint = require("../../src/controllers/getApiStudentIdPoints.js");
const context = require("../../src/context.js");
const db = require("../../src/database/_export.js");

describe("if student doesn't exist", () => {
  test("returns not found", async () => {
    const sso = await endpoint.logic({ id: "1" }, context);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });
});

describe("if student does exist", () => {
  let sID = genStudentID();

  beforeAll(async () => {
    let add = await db.addStudent({
      student_id: sID,
      first_name: "John",
      last_name: "Doe",
    });

    expect(add.ok).toBe(true);
  });

  afterAll(async () => {
    let remove = await db.removeStudentByID(sID);

    expect(remove.ok).toBe(true);
  });

  test("returns not found if no points exist", async () => {
    const sso = await endpoint.logic({ id: sID }, context);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });

  test("returns point details if points exist", async () => {
    await db.addPointsToStudent(sID, 5, "Test");

    const sso = await endpoint.logic({ id: sID }, context);

    expect(sso.ok).toBe(true);
    // TODO maybe test with Joi?
    expect(sso.content).toBeArray();
    expect(sso.content[0].student).toBe(sID);
    expect(sso.content[0].points_modified).toBe("5");
    expect(sso.content[0].points_action).toBe("added");
    expect(sso.content[0].points_before).toBe("0");
    expect(sso.content[0].points_after).toBe("5");
    expect(sso.content[0].reason).toBe("Test");
  });
});

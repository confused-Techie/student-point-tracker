const endpoint = require("../../src/controllers/postApiStudentIdPoints.js");
const context = require("../../src/context.js");
const db = require("../../src/database/_export.js");

describe("if student doesn't exist", () => {
  test("returns unauthorized when user is not admin", async () => {
    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: false, short: "unauthorized" };
    };

    const sso = await endpoint.logic({ id: "1" }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("unauthorized");
  });

  test("returns not found when user is admin", async () => {
    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: true };
    };

    const sso = await endpoint.logic({ id: "1" }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });
});

describe("if the student does exist", () => {
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

  test("returns unauthorized when user is not admin", async () => {
    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: false, short: "unauthorized" };
    };

    const sso = await endpoint.logic({ id: sID }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("unauthorized");
  });

  test("adds points to student when user is admin", async () => {
    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: true };
    };

    const sso = await endpoint.logic(
      { id: sID, points: 10, reason: "Test" },
      context
    );

    expect(sso.ok).toBe(true);

    const student = await db.getStudentByID(sID);

    expect(student.ok).toBe(true);
    expect(student.content.points).toBe("10");
    expect(student.content.student_id).toBe(sID);
  });
});

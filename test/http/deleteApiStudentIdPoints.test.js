const endpoint = require("../../src/controllers/deleteApiStudentIdPoints.js");
const context = require("../../src/context.js");
const db = require("../../src/database/_export.js");

describe("behaves correctly", () => {
  test("Returns unauthorized if unable to login", async () => {
    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: false, short: "unauthorized" };
    };

    const sso = await endpoint.logic({ id: "1" }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("unauthorized");
  });

  test("Returns not found if student doesn't exist", async () => {
    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: true };
    };
    const sso = await endpoint.logic({ id: "1" }, localContext);

    expect(sso.ok).toBe(false);
    expect(sso.content.short).toBe("not_found");
  });

  test("Successfully brings points into the negative points from a student when they have zero points", async () => {
    const sID = genStudentID();

    await db.addStudent({
      student_id: sID,
      first_name: "John",
      last_name: "Doe",
    });

    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: true };
    };

    const sso = await endpoint.logic(
      {
        id: sID,
        points: 10,
        reason: "Test",
      },
      localContext
    );

    expect(sso.ok).toBe(true);

    const leftover = await db.getStudentByID(sID);

    expect(leftover.ok).toBe(true);
    expect(leftover.content.points).toBe("-10");
    expect(leftover.content.student_id).toBe(sID);

    await db.removeStudentByID(sID);
  });

  test("Successfully deletes points from a student when they have less points than being removed", async () => {
    const sID = genStudentID();

    await db.addStudent({
      student_id: sID,
      first_name: "John",
      last_name: "Doe",
    });

    await db.addPointsToStudent(sID, 5, "Test");

    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: true };
    };

    const sso = await endpoint.logic(
      {
        id: sID,
        points: 10,
        reason: "Test",
      },
      localContext
    );

    expect(sso.ok).toBe(true);

    const leftover = await db.getStudentByID(sID);

    expect(leftover.ok).toBe(true);
    expect(leftover.content.points).toBe("-5");
    expect(leftover.content.student_id).toBe(sID);

    await db.removeStudentByID(sID);
  });

  test("Successfully deletes points from a student who has positive points left over", async () => {
    const sID = genStudentID();

    await db.addStudent({
      student_id: sID,
      first_name: "John",
      last_name: "Doe",
    });

    await db.addPointsToStudent(sID, 20, "Test");

    let localContext = context;
    localContext.auth.isAdmin = () => {
      return { ok: true };
    };

    const sso = await endpoint.logic(
      {
        id: sID,
        points: 10,
        reason: "Test",
      },
      localContext
    );

    expect(sso.ok).toBe(true);

    const leftover = await db.getStudentByID(sID);

    expect(leftover.ok).toBe(true);
    expect(leftover.content.points).toBe("10");
    expect(leftover.content.student_id).toBe(sID);

    await db.removeStudentByID(sID);
  });
});

const context = require("../../src/context.js");

describe("Can add points to student", () => {
  beforeAll(async () => {
    const addStudent = await context.database.addStudent({
      student_id: 1234,
      first_name: "John",
      last_name: "Smith",
    });

    const getStudent = await context.database.getStudentByID("1234");

    expect(getStudent.content.student_id).toBe("1234");
    expect(getStudent.content.first_name).toBe("John");
    expect(getStudent.content.last_name).toBe("Smith");
  });

  afterAll(async () => {
    const removeStudent = await context.database.removeStudentByID("1234");
  });

  test("Add points to student", async () => {
    const studentBefore = await context.database.getStudentByID("1234");
    expect(studentBefore.ok).toBe(true);
    expect(studentBefore.content.points).toBe("0");

    const addPoints = await context.database.addPointsToStudent(
      1234,
      10,
      "test points"
    );
    expect(addPoints.ok).toBe(true);

    const studentAfter = await context.database.getStudentByID("1234");
    expect(studentAfter.ok).toBe(true);
    expect(studentAfter.content.points).toBe("10");

    const studentPoints = await context.database.getPointsByStudentID("1234");
    expect(studentPoints.ok).toBe(true);
    expect(Array.isArray(studentPoints.content)).toBe(true);
    expect(studentPoints.content.length).toBe(1);
    expect(studentPoints.content[0].student).toBe("1234");
    expect(studentPoints.content[0].reason).toBe("test points");
    expect(studentPoints.content[0].points_modified).toBe("10");
    expect(studentPoints.content[0].points_action).toBe("added");
    expect(studentPoints.content[0].points_before).toBe("0");
    expect(studentPoints.content[0].points_after).toBe("10");
    console.log(studentPoints.content[0]);
    console.log("STUDENT POINTS ^^^");
  });

  test("Unable to add points to student who doesn't exist", async () => {
    const addPoints = await context.database.addPointsToStudent(
      12345,
      10,
      "test points"
    );

    expect(addPoints.ok).toBe(false);
    expect(addPoints.short).toBe("not_found");
    expect(addPoints.content).toBe("Student 12345 not found.");
  });
});

const context = require("../../src/context.js");

// === WARNING: Seems that during local testing there's a slight variance
// of a few microseconds between the PostGreSQL process, and the NodeJS process.
// As such we will preform light manipulation of times used accordingly

describe("Verify Date can be destructured", () => {
  test("By using recommended creation", async () => {
    const todaysDate = new Date().toISOString();
    const validSyntax = await context.database.getPointsByStudentIDByDate(
      "12345",
      todaysDate
    );

    expect(validSyntax.ok).toBe(false);
    expect(validSyntax.content).toBe(
      "Student 12345 not found. Or points not found."
    );
    expect(validSyntax.short).toBe("not_found");
  });
});

describe("Can retrieve students by date correctly", () => {
  const dateBeforeTestUnmodified = new Date();
  // Go back in time just a little bit to ensure we occur before
  // point additions within PostgreSQL
  dateBeforeTestUnmodified.setSeconds(dateBeforeTestUnmodified.getSeconds() - 1);
  const dateBeforeTest = dateBeforeTestUnmodified.toISOString();
  beforeAll(async () => {
    const sql = context.database.getSqlStorageObject();

    const addStudent = await context.database.addStudent({
      student_id: 1234,
      first_name: "John",
      last_name: "Smith",
    });

    const addPoints = await context.database.addPointsToStudent(
      1234,
      10,
      "test points"
    );
  });

  afterAll(async () => {
    const removeStudent = await context.database.removeStudentByID("1234");
  });

  test("Can get points added to student at all", async () => {
    const pointsEverAdded = await context.database.getPointsByStudentIDByDate(
      1234,
      dateBeforeTest
    );

    expect(pointsEverAdded.ok).toBe(true);
    expect(Array.isArray(pointsEverAdded.content)).toBe(true);
    expect(pointsEverAdded.content.length).toBe(1);
    expect(pointsEverAdded.content[0].student).toBe("1234");
    expect(pointsEverAdded.content[0].points_modified).toBe("10");
    expect(pointsEverAdded.content[0].points_action).toBe("added");
    expect(pointsEverAdded.content[0].reason).toBe("test points");
  });

  test("Cannot get points if after timeframe ", async () => {
    const dateAfterAdditionUnmodified = new Date();
    dateAfterAdditionUnmodified.setSeconds(dateAfterAdditionUnmodified.getSeconds() + 2);
    const dateAfterAddition = dateAfterAdditionUnmodified.toISOString();

    const pointsAddedRecently = await context.database.getPointsByStudentIDByDate(
      1234,
      dateAfterAddition
    );

    expect(pointsAddedRecently.ok).toBe(false);
    expect(pointsAddedRecently.short).toBe("not_found");
    expect(pointsAddedRecently.content).toBe("Student 1234 not found. Or points not found.");
  });
});

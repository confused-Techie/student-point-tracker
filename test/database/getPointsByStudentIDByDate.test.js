const context = require("../../src/context.js");

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

describe("Can retreive students by date correctly", () => {
  const dateBeforeTest = new Date().toISOString();
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

  test("Cannot get points for the right timeframe", async () => {
    const dateAfterAddition = new Date().toISOString();
    console.log(dateAfterAddition);

    const pointsAddedRecently =
      await context.database.getPointsByStudentIDByDate(
        1234,
        dateAfterAddition
      );

    console.log(pointsAddedRecently);
    expect(pointsAddedRecently.ok).toBe(false);
    expect(Array.isArray(pointsAddedRecently.content)).toBe(false);
  });
});

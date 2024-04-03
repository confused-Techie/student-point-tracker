const context = require("../../src/context.js");

describe("Verify Date can be destructured", () => {
  test("By using recommended creation", async () => {
    const todaysDate = new Date().toISOString();
    const validSyntax = await context.database.getPointsByStudentIDByDate("12345", todaysDate);

    expect(validSyntax.ok).toBe(false);
    expect(validSyntax.content).toBe("Student 12345 not found. Or points not found.");
    expect(validSyntax.short).toBe("not_found");
  });
});

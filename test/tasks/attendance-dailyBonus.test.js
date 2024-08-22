const fs = require("fs");
const path = require("path");
const context = require("../../src/context.js");
const task = require("../../src/tasks/attendance-dailyBonus.js");

describe("Is able to award the bonus correctly", () => {
  let config = {};
  beforeAll(async () => {
    // Create students in question
    const addStudent1 = await context.database.addStudent({
      student_id: 1234,
      first_name: "John",
      last_name: "Smith",
    });
    expect(addStudent1.ok).toBe(true);

    const addStudent2 = await context.database.addStudent({
      student_id: 5678,
      first_name: "Jane",
      last_name: "Smith",
    });
    expect(addStudent2.ok).toBe(true);
    // Create attendance record
    const text =
      "student_id,first_name,last_name,period,event,date\n1234,John,Smith,7,A,2024/06/08\n";
    fs.mkdirSync(path.join(__dirname, "./fixtures"));
    fs.writeFileSync(path.join(__dirname, "./fixtures/att.csv"), text, {
      encoding: "utf8",
    });
    // Create Config
    config.RESOURCE_PATH = path.resolve(path.join(__dirname, "./fixtures"));
    config.MOUNTED_RESOURCE_PATH = path.resolve(
      path.join(__dirname, "./fixtures")
    );
    config.ATTENDANCE_FILE = path.resolve(
      path.join(__dirname, "./fixtures/att.csv")
    );
  });

  afterAll(async () => {
    // Clean up fixtures
    fs.rmSync(path.join(__dirname, "./fixtures/att.csv"), {
      recursive: true,
      force: true,
    });
    // Remove students
    const remStudent1 = await context.database.removeStudentByID("1234");
    expect(remStudent1.ok).toBe(true);
    const remStudent2 = await context.database.removeStudentByID("5678");
    expect(remStudent2.ok).toBe(true);
  });

  test("Awards the bonus correctly", async () => {
    const execute = await task(context, config);
    expect(execute).toBe(0);

    const student1Points = await context.database.getPointsByStudentID("1234");
    // Since this student should have no point history, this call will fail
    expect(student1Points.ok).toBe(false);
    expect(student1Points.content).toBe(
      "Student 1234 not found. Or points not found."
    );
    expect(student1Points.short).toBe("not_found");

    const student2Points = await context.database.getPointsByStudentID("5678");
    expect(student2Points.ok).toBe(true);
    expect(Array.isArray(student2Points.content)).toBe(true);
    expect(student2Points.content.length).toBe(1);
    expect(student2Points.content[0].student).toBe("5678");
    expect(student2Points.content[0].reason).toBe("Daily Bonus for Attendance");
    expect(student2Points.content[0].points_modified).toBe("1");
    expect(student2Points.content[0].points_before).toBe("0");
    expect(student2Points.content[0].points_after).toBe("1");
  });
});

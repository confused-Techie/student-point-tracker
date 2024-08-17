/*
 * Pre-Built Task: attendance.DailyBonus
 * This task will read a PowerSchool attendance export, and use this to determine
 * if a student that has attended to school that day, will receive a point.
 *
 * Since PowerSchool Attendance reports are a transactional log of students that
 * were gone from school for various reasons we will work to find who **isn't**
 * on that list, and reward them with a point.
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const POINT_COUNT = 1;
const POINT_REASON = "Daily Bonus for Attendance";

module.exports = async function main(context, config) {
  const fileContent = fs.readFileSync(
    path.resolve(config.RESOURCE_PATH, "./att.csv"),
    { encoding: "utf8" }
  );
  const data = parse(fileContent, {
    delimiter: ",",
    columns: [
      "student_id",
      "first_name",
      "last_name",
      "period",
      "event",
      "date",
    ],
  });

  // === Lets first build a list of students that had an attendance event for this
  // report. Since this list may contain duplicates
  const students_reported = new Map();

  for (let i = 0; i < data.length; i++) {
    const entry = data[i];

    if (students_reported.has(entry.student_id)) {
      // This student is already on this list, modify the reason they are here
      let reportedStudent = students_reported.get(entry.student_id);
      reportedStudent.entries.push(entry);
    } else {
      // This student isn't yet on this list, lets add them
      let entryArray = [];
      entryArray.push(entry);

      students_reported.set(entry.student_id, {
        entries: entryArray,
      });
    }
  }

  // === Now that we have a full list of effected students, lets get a full list
  // of all students, and reward anyone not on this list
  const allStudents = await context.database.getAllStudentIDs();

  if (!allStudents.ok) {
    console.error(`We failed to get all students! '${allStudents.content}'`);
    throw allStudents;
  }

  // With a list of all students, let's iterate through it, and reward those we
  // can't find on the reported list
  for (let i = 0; i < allStudents.content.length; i++) {
    let student = allStudents.content[i];

    if (!students_reported.has(student.student_id)) {
      // This student is not on the reported list
      const addPoints = await context.database.addPointsToStudent(
        `${student.student_id}`,
        POINT_COUNT,
        POINT_REASON
      );
      if (!addPoints.ok) {
        console.error(
          `Failed to add points to ${student.student_id}! Will keep trying others...`
        );
        console.error(addPoints);
        // don't throw and keep trying
      }
    }
  }

  // We've given points to all students who have attended school today. Let's exit
  console.log("Done adding the daily bonus of points based on attendance.");
  return 0;
};

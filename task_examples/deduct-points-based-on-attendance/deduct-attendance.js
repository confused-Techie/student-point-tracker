/*
 * This task will read an attendance export from PowerSchool.
 * Which seems to be a transactional log of attendance events.
 * So this will only include students who have had some change in attendance
 * for the day.
 */

const fs = require("fs");
const { parse } = require("csv-parse/sync");

const POINT_REMOVE_COUNT = 1;
const POINT_REASON = "Student marked"; // + The item they were marked

module.exports = async function main(context) {
  let fileContent = fs.readFileSync("./att.csv", "utf8");
  let data = parse(fileContent, {
    delimiter: ",",
    columns: [ "student_id", "first_name", "last_name", "period", "event", "date" ]
  });

    // Event Types: (For each specified period)
    // - A: Absent
    // - L: Late
    // - T: Tardy
    // - S:
    // - I:
    // - X:
    // - '':

    // Now an important thing to remember, is this list may contain the same
    // student multiple times
    let students_effected = [];

    for (let i = 0; i < data.length; i++) {
      let entry = data[i];

      if (!students_effected.includes(entry.student_id)) {

        if (entry.event === "A") {
          await removePoints(entry.student_id, context, "Absent");
          students_effected.push(entry.student_id);
        } else if (data.event === "T") {
          await removePoints(entry.student_id, context, "Tardy");
          students_effected.push(entry.student_id);
        }

      } // else we have already removed points for this student today
    }

  console.log("Done calculating any point losses due to absences");
  return 0;
};

async function removePoints(studentID, context, shortReason) {
  console.log(`Attempting to remove '${studentID}s' points due to: '${shortReason}'`);
  const act = await context.database.removePointsFromStudent(
    studentID,
    POINT_COUNT,
    `${POINT_REASON} ${shortReason}`,
  );

  if (!act.ok) {
    console.error(
      `Failed to remove points from '${studentID}'! Will continue to attempt others.`,
    );
    console.error(act);
  }
  return;
}

/*
 * Pre-Built Task: attendance.DailyPenalty
 * This task will read a PowerSchool attendance export, and use this to determine
 * if a student that has been missing today, will lose a point.
 *
 * Since PowerSchool Attendance reports are a transactional log of students that
 * where gone from school for various reasons we will work to find each individual,
 * unique student on this list, and remove a point from them.
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const POINT_COUNT = 1;
const POINT_REASON = "Student was marked:"; // + The item they were marked for

module.exports = async function main(context, config) {
  const fileContent = fs.readFileSync(
    config.ATTENDANCE_FILE,
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

  // === Now that we have a full list of effected students, lets iterate this list
  // to deduct a point for each valid reason that may appear on the entries array
  const craftReasonString = (entries) => {
    let reason = POINT_REASON;

    for (let i = 0; i < entries.length; i++) {
      let reasonText = "???";
      // These strings are mirrored in `attendance-weeklyBonus.js`
      if (entries[i].event === "A") {
        reasonText = "Absent";
      } else if (entries[i].event === "L") {
        reasonText = "Late";
      } else if (entries[i].event === "T") {
        reasonText = "Tardy";
      } else if (entries[i].event === "S") {
        reasonText = "Suspension";
      } else if (entries[i].event === "I") {
        reasonText = "Illness";
      } else if (entries[i].event === "X") {
        reasonText = "Unexcused Absence";
      }

      reason += ` '${reasonText}' for period '${entries[i].period}';`;
    }

    return reason;
  };

  students_reported.forEach(async (value, key, map) => {
    // TODO: Should students always be set to lose points no matter what the event is?
    // For now, lets assume they are
    const removePoints = await context.database.removePointsFromStudent(
      `${key}`,
      POINT_COUNT,
      craftReasonString(value.entries)
    );

    if (!removePoints.ok) {
      console.error(
        `Failed to remove points from '${key}'! Will continue trying...`
      );
      console.error(removePoints);
    }
  });

  console.log("Done adding Daily Penalty");
  return 0;
};

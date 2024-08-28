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
  const fileContent = fs.readFileSync(config.ATTENDANCE_FILE, {
    encoding: "utf8",
  });
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

    if (entry.period !== "1") {
      // We only want to collect attendance data for homeroom
      continue;
    }
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

  students_reported.forEach(async (value, key, map) => {
    // TODO: Should students always be set to lose points no matter what the event is?
    // For now, lets assume they are
    const removePoints = await context.database.removePointsFromStudent(
      `${key}`,
      POINT_COUNT,
      aggregateReason(value)
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

function aggregateReason(student) {
  // Here we get a collection of a single students entries from the attendance log
  // But here is where we wil filter out the useless info
  let reason = POINT_REASON;
  let reasonArr = [];

  for (let i = 0; i < student.entries.length; i++) {
    let text = getTextForAttendanceCode(student.entries[i].event);

    if (!reasonArr.includes(text)) {
      reasonArr.push(text);
    }
  }

  return `${reason} for ${reasonArr.join(", ")}`;
}

function getTextForAttendanceCode(code) {
  switch (code) {
    case "DP":
      return "Distant Learning Present";
    case "A":
      return "Absent";
    case "DA":
      return "Distant Learning Absent";
    case "I":
      return "Illness";
    case "DI":
      return "Distant Learning Illness";
    case "E":
      return "Excused Other";
    case "DE":
      return "Distant Learning Excused";
    case "X":
      return "Unexcused Absence";
    case "DX":
      return "Distant Learning Unexcused";
    case "S":
      return "Student Supsended";
    case "T":
      return "Tardy";
    case "L":
      return "Late by not Tardy";
    case "U":
      return "Unverified Absence";
    case "N":
      return "Not Compeleted/IS";
    case "P":
      return "Pending/IS";
    case "C":
      return "Completed/IS";
    case "H":
      return "Home Hospital Nonapportionment";
    default:
      return "???";
  }
}

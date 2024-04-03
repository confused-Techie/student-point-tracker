// Module responsible for importing students from the `students.csv` file
const fs = require("fs");
const path = require("path");
const child_process = require("node:child_process");
const util = require("node:util");
const { parse } = require("csv-parse/sync");
const config = require("./config.js")();
const database = require("./database/_export.js");

const exec = util.promisify(child_process.exec);

module.exports = async function importer(fileName) {
  if (fs.existsSync(fileName)) {
    const studentFile = fs.readFileSync(fileName, { encoding: "utf8" });

    const records = parse(studentFile, {
      delimiter: config.CSV_DELIMITER,
      columns: config.COLUMNS,
      skip_empty_lines: true,
    });

    // This is the list of students encountered during the import that already exist
    // within the DB. Meaning no changes where made.
    const repeatStudentList = [];
    // The list of brand new students being added
    const addedStudentList = [];
    // The list of brand new students who encountered an error being added
    const addFailStudentList = [];

    for (const record of records) {
      // Lets normalize our values here
      for (const item in record) {
        record[item.trim()] = record[item].trim();
      }

      if (
        typeof record.student_id !== "string" ||
        typeof record.first_name !== "string" ||
        typeof record.last_name !== "string"
      ) {
        console.error(`The import: ${record} is invalid!`);
        continue;
      }

      // Check if student already exists
      const exists = await database.getStudentByID(record.student_id);

      if (exists.ok) {
        console.log(
          `Student '${record.student_id}' already exists in the DB. Skipping...`
        );
        repeatStudentList.push(exists.content);
        continue;
      }

      const action = await database.addStudent(record);

      if (!action.ok) {
        console.error("An error occuring during the import of new students!");
        console.error(action);
        addFailStudentList.push(record);
        continue;
      }

      if (typeof record.points === "string") {
        console.log(
          `Existing points found for ${record.student_id}! Importing...`
        );

        const pointAction = await database.addPointsToStudent(
          record.student_id,
          record.points,
          "Import"
        );

        if (!pointAction.ok) {
          console.error(
            "An error occuring during the import of a students existing points!"
          );
          console.error(pointAction);
          addFailStudentList.push(record);
          continue;
        }
      }

      console.log(`Imported '${record.student_id}' without issue...`);
      addedStudentList.push(record);
    }

    // Once we have imported all users we can now go ahead and disable any users that did not appear in the import
    // Especially since we now have a full list of all students we have modified,
    // Even the ones we wanted to add, but failed to do so
    let modifiedStudentList = addedStudentList.concat(
      repeatStudentList.concat(addFailStudentList)
    );

    let allStudents = await database.getAllStudentIDs();

    if (!allStudents.ok) {
      console.error("Failed to get full list of students!");
      console.error(allStudents);
    }

    for (let i = 0; i < allStudents.content.length; i++) {
      if (notPresentInList(allStudents.content[i], modifiedStudentList)) {
        // We check that the current already existing student doesn't appear anywhere
        // in the list of students that were on our import in some way.
        // So we assume they should be disabled.
        let disable = await database.disableStudentByID(
          allStudents.content[i].student_id
        );

        if (!disable.ok) {
          console.error("Failed to disable student");
          console.error(disable);
        }

        console.log(
          `Disabled: '${allStudents.content[i].student_id}' since they did not appear in the import.`
        );
      }
    }
  } else {
    console.error(`File: '${fileName}' not found!`);
    console.error("Will attempt to find file not assuming locality");
    console.error(
      `Below is the known contents of: '${path.dirname(fileName)}'`
    );
    console.error(fs.readdirSync(path.dirname(fileName)));
  }
};

function notPresentInList(current, list) {
  let matched = false;
  for (let i = 0; i < list.length; i++) {
    if (list[i].student_id === current.student_id) {
      matched = true;
      break;
    }
  }

  return !matched;
}

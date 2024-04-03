const POINT_COUNT = 1;
const POINT_REASON = "Daily Bonus";

module.exports = async function main(context) {
  const todaysDate = new Date().toISOString(); // Using ISO string so it's format works with Postgresql
  const allStudents = await context.database.getAllStudentIDs();

  if (!allStudents.ok) {
    console.error("We failed to get all students!");
    throw allStudents;
  }

  // Now that we have all students, we want to make sure they were not absent today
  // as long as we ensure to run  the attendance based task first, we can just check history
  for (let i = 0; i < allStudents.content.length; i++) {
    // get student history
    const studentHistory = await context.database.getPointsByStudentIDByDate(
      allStudents.content[i].student_id,
      todaysDate
    );

    if (!studentHistory.ok) {
      console.error(`Failed to get previous point history for student!`);
      console.error(studentHistory);
      continue;
    }

    let didHaveAbsence = false;

    for (let y = 0; y < studentHistory.content.length; y++) {
      let reason = studentHistory.content[y].reason;
      if (reason.includes("Tardy") || reason.includes("Absent")) {
        didHaveAbsence = true;
        break;
      }
    }

    if (!didHaveAbsence) {
      const addPoints = await context.database.addPointsToStudent(
        allStudents.content[i].student_id,
        POINT_COUNT,
        POINT_REASON
      );

      if (!addPoints.ok) {
        console.error(
          `Failed to add points to ${allStudents.content[i].student_id}! Will keep trying others...`
        );
        console.error(addPoints);
        // don't throw to keep trying
      }
    }
  }

  // After all attempts for now just return `0` but we could probably conditionally do this
  console.log("Done adding the daily bonus of points.");
  return 0;
};

const POINT_COUNT = 2;
const POINT_REASON = "Weekly Attendance Bonus";

module.exports = async function main(context) {
  let tmpDate = new Date();
  let tmpPastDate = tmpDate.setDate(tmpDate.getDate() - 7); // Minus 7 DAYS
  const lastWeekDate = tmpPastDate.toISOString();

  const allStudents = await context.database.getAllStudentIDs();

  if (!allStudents.ok) {
    console.error("We failed to get all students!");
    throw allStudents;
  }

  for (let i = 0; i < allStudents.content.length; i++) {
    const studentHistory = await context.database.getPointsByStudentIDByDate(
      allStudents.content[i].student_id,
      lastWeekDate
    );

    if (!studentHistory.ok) {
      console.error("Failed to get previous point history for student!");
      console.error(studentHistory);
      continue;
    }

    for (let y = 0; y < studentHistory.content.length; y++) {
      let reason = studentHistory.content[y].reason;
      if (reason.includes("Tardy") || reason.includes("Absent")) {
        continue;
      }
    }

    const addPoints = await context.database.addPointsToStudent(
      allStudents.content[i].student_id,
      POINT_COUNT,
      POINT_REASON
    );

    if (!addPoints.ok) {
      console.error(
        `Failed to add points to ${allStudents.content[i].student_id}! Will keep trying the others`
      );
      console.error(addPoints);
    }
  }

  console.log("Done adding extra points.");
};

/*
  * Pre-Built Task: attendance.WeeklyBonus
  * This taks will read every students point history, to determine if they have
  * recieved a attendance daily penalty on any day that week.
  * If they have not they will then receive a bonus.
  *
  * Because this task checks points recieved since the last Sunday, it should be
  * run every Friday at Midnight.
*/

const POINT_COUNT = 2;
const POINT_REASON = "Weekly Attendance Bonus";

module.exports = async function main(context, config) {
  const tmpDate = new Date();
  tmpDate.setDay(0); // Set the day to Sunday
  const lastWeekDate = tmpDate.toISOString();

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
      console.error(`We failed to get the student's '${allStudents.content[i].student_id}' point history!`);
      // Don't throw, we want to continue
      console.error(studentHistory);
      continue;
    }

    for (let y = 0; y < studentHistory.content.length; y++) {
      const reason = studentHistory.content[y].reason;
      if (
        reason.toLowerCase().includes("absent") ||
        reason.toLowerCase().includes("late") ||
        reason.toLowerCase().includes("tardy") ||
        reason.toLowerCase().includes("suspension") ||
        reason.toLowerCase().includes("illness") ||
        reason.toLowerCase().includes("unexcused absence")
      ) {
        continue;
      }
    }

    const addPoints = await context.database.addPointsToStudent(
      allStudents.content[i].student_id,
      POINT_COUNT,
      POINT_REASON
    );

    if (!addPoints.ok) {
      console.error(`Failed to add points to ${allStudents.content[i].student_id}`);
      console.error(addPoints);
    }
  }

  console.log("Done adding weekly bonus");
  return 0;
};

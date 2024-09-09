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
  const today = new Date();
  const day = today.getDay() || 7; // Get current day number, converting Sun(0) to 7
  if (day !== 1) { // Adjust only if the day isn't Monday
    today.setHours(-24 * (day - 1)); // Set hours to day number minus 1
    // multiplied by negative 24
  }
  const lastWeekDate = today.toISOString();
  // lastWeekDate should now be sunday 

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
      console.error(
        `We failed to get the student's '${allStudents.content[i].student_id}' point history!`
      );
      // Don't throw, we want to continue
      console.error(studentHistory);
      continue;
    }

    // Since we want to make an approxomite assumption of a student getting a bonus
    // point everyday of the week, we will just verify that a student had gotten
    // 5 points this past week.
    // TODO despite the downfalls of this method
    if (studentHistory.content.length < 5) {
      continue;
    }

    const addPoints = await context.database.addPointsToStudent(
      `${allStudents.content[i].student_id}`,
      POINT_COUNT,
      POINT_REASON
    );

    if (!addPoints.ok) {
      console.error(
        `Failed to add points to ${allStudents.content[i].student_id}`
      );
      console.error(addPoints);
    }
  }

  console.log("Done adding weekly bonus");
  return 0;
};

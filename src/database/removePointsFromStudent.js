const getStudentByID = require("./getStudentByID.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, id, points, reason) => {
    let student = await getStudentByID(sql, id);

    if (!student.ok) {
      return student;
    }

    let newPointsAmount =
      parseInt(student.content.points, 10) - parseInt(points, 10);

    if (newPointsAmount < 0 && false) {
      // use an AND FALSE to attempt a simple way to switch between negative number support
      // Don't go into the negatives for points
      newPointsAmount = 0;
    }

    return await sql
      .begin(async (sqlTrans) => {
        let insertNewPoints = {};
        try {
          insertNewPoints = await sqlTrans`
            INSERT INTO points (student, points_modified, points_action, points_before, points_after, reason)
            VALUES (${id}, ${points}, 'removed', ${student.content.points}, ${newPointsAmount}, ${reason})
            RETURNING point_id;
          `;
        } catch (e) {
          throw `A constraint has been violated while removing ${id}'s new negative points! ${e.toString()}`;
        }

        if (!insertNewPoints.count) {
          throw `Cannot remove points from ${id}!`;
        }

        // Add the new total points
        let modifyPoints = {};
        try {
          modifyPoints = await sqlTrans`
            UPDATE students
            SET points = ${newPointsAmount}
            WHERE student_id = ${id} AND enabled = TRUE
            RETURNING student_id;
          `;
        } catch (e) {
          throw `A constraint has been violated while removing ${id}'s new negaitve points! ${e.toString()}`;
        }

        if (!modifyPoints.count) {
          throw `Cannot remove points from ${id}!`;
        }

        return { ok: true };
      })
      .catch((err) => {
        return {
          ok: false,
          content: err,
          short: "server_error",
        };
      });
  },
};

const getStudentByID = require("./getStudentByID.js").exec;

module.exports = {
  safe: false,
  exec: async (sql, id, points, reason) => {
    let student = await getStudentByID(sql, id);

    if (!student.ok) {
      return student;
    }

    const newPointsAmount =
      parseInt(student.content.points, 10) + parseInt(points, 10);

    return await sql
      .begin(async (sqlTrans) => {
        let insertNewPoints = {};
        try {
          insertNewPoints = await sqlTrans`
            INSERT INTO points (student, points_modified, points_action, points_before, points_after, reason)
            VALUES (${id}, ${points}, 'added', ${student.content.points}, ${newPointsAmount}, ${reason})
            RETURNING point_id;
          `;
        } catch (e) {
          throw `A constraint has been violated while inserting ${id}'s new points! ${e.toString()}`;
        }

        if (!insertNewPoints.count) {
          throw `Cannot insert points to ${id}!`;
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
          throw `A constraint has been violated while inserting ${id}'s new points! ${e.toString()}`;
        }

        if (!modifyPoints.count) {
          throw `Cannot insert points to ${id}!`;
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

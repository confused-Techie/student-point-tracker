module.exports = {
  safe: false,
  exec: async (sql, id) => {
    return await sql
      .begin(async (sqlTrans) => {
        const removePoints = await sqlTrans`
          DELETE FROM points
          WHERE student = ${id}
          RETURNING point_id;
        `;

        if (removePoints.count === 0) {
          throw `Failed to remove points for ${id}`;
        }

        const removeStudent = await sqlTrans`
          DELETE FROM students
          WHERE student_id = ${id}
          RETURNING student_id;
        `;

        if (removeStudent.count === 0) {
          throw `Failed to remove student ${id}`;
        }

        return {
          ok: true,
          content: `Successfully deleted student '${id}'`,
        };
      })
      .catch((err) => {
        return typeof err === "string"
          ? { ok: false, content: err, short: "server_error" }
          : {
              ok: false,
              content: `A generic error occurred while removing student '${id}'.`,
              short: "server_error",
              error: err,
            };
      });
  },
};

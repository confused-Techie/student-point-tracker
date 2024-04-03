module.exports = {
  safe: false,
  exec: async (sql, id) => {
    const command = await sql`
      UPDATE students
      SET enabled = TRUE
      WHERE student_id = ${id}
      RETURNING student_id;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : { ok: false, content: command, short: "server_error" };
  },
};

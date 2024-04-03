module.exports = {
  safe: false,
  exec: async (sql, obj) => {
    const command = await sql`
      INSERT INTO students (student_id, first_name, last_name)
      VALUES (${obj.student_id}, ${obj.first_name}, ${obj.last_name})
      RETURNING student_id;
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : { ok: false, content: command, short: "server_error" };
  },
};

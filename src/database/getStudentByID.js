module.exports = {
  safe: false,
  exec: async (sql, id) => {
    const command = await sql`
      SELECT *
      FROM students
      WHERE student_id = ${id}
    `;

    return command.count !== 0
      ? { ok: true, content: command[0] }
      : {
          ok: false,
          content: `Student ${id} not found.`,
          short: "not_found",
        };
  },
};

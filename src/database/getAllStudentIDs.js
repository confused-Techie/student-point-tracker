module.exports = {
  safe: false,
  exec: async (sql) => {
    const command = await sql`
      SELECT *
      FROM students
      WHERE enabled = TRUE
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: `no students found.`,
          short: "not_found",
        };
  },
};

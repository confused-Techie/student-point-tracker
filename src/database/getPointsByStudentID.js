module.exports = {
  safe: false,
  exec: async (sql, id) => {
    const command = await sql`
      SELECT *
      FROM points
      WHERE student = ${id}
      ORDER BY created DESC
    `;

    return command.count !== 0
      ? { ok: true, content: command }
      : {
          ok: false,
          content: `Student ${id} not found. Or points not found.`,
          short: "not_found",
        };
  },
};

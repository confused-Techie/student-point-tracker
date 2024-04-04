module.exports = {
  safe: false,
  exec: async (sql, id, date) => {
    /**
     * It is mandatory that the dates provided to this function are exactly as follows:
     * 'YYYY-MM-DDTHH:mi:ss.msZ'
     * A format losely based off ISO8601
     * And what you are provided using JavaScript: 'new Date().toISOString()'
     * Any other format WILL NOT WORK.
     */
    const command = await sql`
      SELECT *
      FROM points
      WHERE student = ${id} AND created >= to_timestamp(${date}, 'YYYY-MM-DDTHH24:MI:SS.MSZ') at time zone 'utc'
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

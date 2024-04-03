const config = require("../config.js")();

module.exports = {
  safe: false,
  exec: async (sql, query, page) => {
    const limit = config.PAGINATION_LIMIT;
    const offset = page > 1 ? (page - 1) * limit : 0;

    const wordSeparators = /[-. ]/g; // Word Sperators: - . SPACE
    const searchTerm =
      "%" + query.toLowerCase().replace(wordSeparators, "%") + "%";

    const command = await sql`
      SELECT *
      FROM students
      WHERE
      (
        LOWER(first_name) LIKE ${searchTerm}
        OR LOWER(last_name) LIKE ${searchTerm}
        OR CAST(student_id AS TEXT) LIKE ${searchTerm}
      ) AND enabled = TRUE
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    const resultCount = command.length ?? 0;
    const quotient = Math.trunc(resultCount / limit);
    const remainder = resultCount % limit;
    const totalPages = quotient + (remainder > 0 ? 1 : 0);

    return {
      ok: true,
      content: command,
      pagination: {
        count: resultCount,
        page: page < totalPages ? page : totalPages,
        total: totalPages,
        limit: limit,
      },
    };
  },
};

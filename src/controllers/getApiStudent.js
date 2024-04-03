module.exports = {
  docs: {
    summary: "Search for a specific user.",
  },
  endpoint: {
    method: "GET",
    paths: ["/api/student"],
    rateLimit: "generic",
    successStatus: 200,
    options: {
      Allow: "GET",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    query: (context, req) => {
      return context.query.query(req);
    },
    page: (context, req) => {
      return context.query.page(req);
    },
  },

  async logic(params, context) {
    let search = await context.database.searchStudent(
      params.query,
      params.page
    );

    if (!search.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(search)
        .addCalls("db.searchStudent", search);
    }

    const searchResults = context.studentObjectArray(search.content);

    const sso = new context.ssoPaginate();

    sso.total = search.pagination.total;
    sso.limit = search.pagination.limit;
    sso.buildLink(
      `${context.config.SERVER_URL}/api/student`,
      search.pagination.page,
      params
    );

    return sso.isOk().addContent(searchResults);
  },
};

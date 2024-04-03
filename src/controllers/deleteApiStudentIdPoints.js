module.exports = {
  docs: {
    summary: "Remove points of a specific user.",
  },
  endpoint: {
    method: "DELETE",
    paths: ["/api/student/:id/points"],
    rateLimit: "generic",
    successStatus: 204,
    options: {
      Allow: "GET, DELETE, POST",
      "X-Content-Type-Options": "nosniff",
    },
  },
  params: {
    id: (context, req) => {
      return context.query.id(req);
    },
    points: (context, req) => {
      return context.query.points(req);
    },
    reason: (context, req) => {
      return context.query.reason(req);
    },
    user: (context, req) => {
      return context.query.user(req);
    },
  },

  async logic(params, context) {
    const admin = context.auth.isAdmin(params.user, context);

    if (!admin.ok) {
      const sso = new context.sso();

      return sso.notOk().addContent(admin);
    }

    let action = await context.database.removePointsFromStudent(
      params.id,
      params.points,
      params.reason
    );

    if (!action.ok) {
      const sso = new context.sso();

      return sso
        .notOk()
        .addContent(action)
        .addCalls("db.removePointsFromStudent", action);
    }

    const sso = new context.sso();

    return sso.isOk().addContent(false);
  },
};

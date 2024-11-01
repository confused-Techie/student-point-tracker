
module.exports =
class Controllers {
  constructor() {

  }

  // Sets up an individual controller
  route() {

  }

  initialize() {
    // Call all endpoint methods
  }

  deleteApiStudentIdPoints() {
    this.route({
      method: "DELETE",
      url: "/api/student/:id/points",
      rate_limit: "generic",
      schema: {
        querystring: {
          id: { type: "integer" },
          points: { type: "integer" },
          reason: { type: "string" },
          user: { type: "string" }
        },
        response: {
          204: {}
        }
      },
      responder: {
        pass: 200,
        fail: 500
      },
      handler: async function (params, http, env) {
        if (!params.user.isAdmin) {
          return env.fail(env.callstack);
        }

        const data = await env.db.removePointsFromStudent(
          params.id,
          params.points,
          params.reason
        );

        env.callstack.add("db.removePointsFromStudent", data);

        if (!data.ok) {
          return env.fail(env.callstack);
        }

        return env.pass();
      },
      handler: async function (params, context) {
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
        return soo.isOk().addContent(false);
      }
    });
  }
}

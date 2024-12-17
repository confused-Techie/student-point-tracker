// Methods of declaring routes!
// Used to setup the route data for all endpoitns/controllers of the server

module.exports =
function index(server) {
  server.frontend.route({ // Just provide a standard OpenAPI Object @see {@link https://swagger.io/specification/#openapi-object}
    openapi: "3.1.0",
    info: {
      title: require("../package.json").title,
      summary: require("../package.json").description,
      license: require("../package.json").license,
      version: require("../package.json").version
    },
    paths: {
      "/api/student/:id/points": {
        description: "",
        delete: {
          "x-rateLimit": "generic", // OpenAPI accepts 'x-..' as custom extensions. Which we can use to define this
          operationId: "deleteApiStudentIdPoints",
          parameters: [
            {
              name: "id",
              in: "query",
              required: true
            }
          ],
          responses: {
            "200": {},
            "500": {}
          },
          "x-responder": {
            // Custom OpenAPI extension, allows relating responder methods to status codes in 'responses'
            pass: 200,
            fail: 500
          },
          handler: async function (params, http, env) {
            if (!params.user.isAdmin) {
              return http.fail(env.callstack);
            }

            const data = await env.db.removePointsFromStudent(
              params.id,
              params.points,
              params.reason
            );

            env.callstack.add("db.removePointsFromStudent", data);

            if (!data.ok) {
              return http.fail(env.callstack);
            }

            return http.pass();
          }
        }
      }
    }
  });
}

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

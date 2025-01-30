/*
  This file exports our customized OpenAPI Schema.
*/
const pkgjson = require("../package.json");

module.exports = {
  openapi: "3.1.0",
  "x-dwsc": "1.0.0",
  info: {
    title: pkgjson.name,
    license: pkgjson.license,
    version: pkgjson.version
  },
  paths: {
    "/login": {
      summary: "Provides the user with the UI to initiate the login flow."
    },
    "/login/federated/google": {
      summary: "Triggers federated Google OAuth login.",
      get: {
        "x-handler": async (params, env) => {
          return env.sever.globals.passport.authenticate("google")(env.req, env.res);
        }
      }
    },
    "/oauth2/redirect/google": {
      summary: "Endpoint users are taken to after completing the Google OAuth sign on flow.",
      get: {
        "x-handler": async (params, env) => {
          return env.server.globals.passport.authenticate("google", {
            successRedirect: "/",
            failureRedirect: "/login"
          })(env.req, env.res);
        }
      }
    },
    "/api/health": {
      summary: "Get the health status across all services.",
      get: {
        "x-handler": async (params, env) => {
          const healthObj = {
            database: "unknown",
            httpServer: "healthy" // TODO we assume since this endpoint is working
            // that the HTTP Server must be healthy
          };

          if (env.database.getSqlStorageObject() == undefined) {
            healthObj.database = "unhealthy";
          } else {
            healthObj.database = "healthy";
          }

          env.OK(healthObj);
        }
      }
    },
    "/api/student": {
      summary: "",
      get: {
        summary: "Search for a specific student.",
        parameters: [
          {
            name: "query",
            in: "query",
            description: "Search string.",
            required: true,
            schema: {
              type: "string",
              maxLength: 50
              // For performance on the server, and assumed dimisinishing returns
              // on longer queries this is cut off at 50 characters. As suggested by
              // Digitalone1 in pulsar-edit/pulsar-backend
            },
            "x-parse": (value, spec) => {
              const prov = value;

              if (typeof prov !== "string") {
                return "";
              }

              // Check for any possible path traversal and return empty if present
              // Also trim strings to maxLength
              // TODO path traversal
              return prov.slice(0, spec.schema.maxLength).trim();
            }
          },
          {
            name: "page",
            in: "query",
            description: "Page number of results.",
            required: false,
            schema: {
              type: "number",
              default: 1
            },
            "x-parse": (value, spec) => {
              switch (typeof value) {
                case "string":
                  const n = parseInt(prov, 10);
                  return isNaN(value) ? spec.schema.default : value;
                case "number":
                  return isNaN(value) ? spec.schema.default : value;
                default:
                  return spec.schema.default;
              }
            }
          }
        ],
        "x-handler": async (params, env) => {
          const search = await env.server.database.searchStudent(
            params.query.parse(),
            params.page.parse()
          );

          env.callstack.addCall("db.searchStudent", search);

          if (!search.ok) {
            return env.InternalServerError(search);
          }

          const searchResults = env.server.models.studentObjectArray(search.content);

          // TODO paginate
          return env.OK(searchResults);
        }
      }
    },
    "/api/student/:id": {
      
    }
  }
};

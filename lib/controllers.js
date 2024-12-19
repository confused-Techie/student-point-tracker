// Export our entire OpenAPI/Server Specification

module.exports = {
  openapi: "3.1.0",
  info: {
    title: require("../package.json").title,
    summary: require("../package.json").summary,
    license: require("../package.json").license,
    version: require("../package.json").version
  },
  paths: {
    "/": {
      summary: "Home page of Student Point Tracker.",
      description: "Displays a search for students, and bulk point controls.",
      get: {
        summary: "Get the page.",
        parameters: [
          {
            name: "token",
            in: "query",
            description: "Some kind of value",
            required: true,
            schema: {
              type: "string"
            }
          }
        ],
        handler: async function (params, env) {
          env.http.res.status(200).json(params);
        }
      }
    }
  }
};

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
    "/example": {
      summary: "",
      description: "",
      get: {

      },
      "x-move": {
        // OpenAPI Extensions 
      }
    }
  }
};

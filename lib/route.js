const Operation = require("./operation.js");

module.exports =
class Route {
  constructor(routePath, oapi, express) {
    this.routePath = routePath; // The string path of our specific route
    this.oapi = oapi; // The full OpenAPI object
    this.express = express; // An instance of ExpressJS

    this.operations = [];
    this.rootParameters = {};

    this.initialize();
  }

  initialize() {
    // Setup the route we've been given per operationObject

    // Since some items, like `parameters` are able to waterfall down, we need to
    // check what/if it's been declared on the top level here
    if (this.oapi.paths[this.routePath]?.parameters) {
      // Decode 'Path Item Object' parameters
      // Add to this.rootParameters
      // TODO
    }

    // Now to handle the Operation Object based on method
    for (const key in this.oapi.paths[this.routePath]) {
      if (["summary", "description", "parameters", "servers"].includes(key)) {
        // Skip keys that have no effect on how we handle the endpoint.
        // Which we've already decoded 'parameters' (Which we do first to ensure order doesn't matter)
        continue;
      }

      // First we need to configure any middleware that should be active on this operation
      let middleware = [];
      // Then define our operation helper
      const operation = new Operation(this.oapi.paths[this.routePath][key], key, this);

      // Then setup the endpoint in ExpressJS depending on the method
      switch(key) {
        case "get":
          this.express.get(this.routePath, middleware, operation.handle);
          break;
        case "put":
          this.express.put(this.routePath, middleware, operation.handle);
          break;
        case "post":
          this.express.post(this.routePath, middleware, operation.handle);
          break;
        case "delete":
          this.express.delete(this.routePath, middleware, operation.handle);
          break;
        case "options":
          // TODO Should we handle here? Or pass along?
        case "head":
        case "patch":
        case "trace":
        // Begin supporting ExpressJS specific supported methods, even if Swagger doesn't
        case "x-checkout":
        case "x-copy":
        case "x-lock":
        case "x-merge":
        case "x-mkactivity":
        case "x-mkcol":
        case "x-move":
        case "x-m-search":
        case "x-notify":
        case "x-purge":
        case "x-report":
        case "x-search":
        case "x-subscribe":
        case "x-unlock":
        case "x-unsubscribe":
        // Maybe look at other official methods neither don't support?
      }

    }
  }
}

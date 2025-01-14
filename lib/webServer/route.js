const Operation = require("./operation.js");
const parameters = require("./parameters.js");

module.exports =
class Route {
  constructor({ routePath, oapi, express, server}) {
    this.routePath = routePath; // The string path of our specific route
    this.oapi = oapi; // The full OpenAPI object
    this.express = express; // An instance of ExpressJS
    this.server = server; // An instance of the main Server

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
      this.rootParameters = parameters(this.oapi.paths[this.routePath].parameters);
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
      this.operations.push(operation);

      // Then setup the endpoint in ExpressJS depending on the method
      // (We bind each operation to it's own self, otherwise it inherits ExpressJS)
      switch(key) {
        case "get":
          this.express.get(this.routePath, middleware, operation.handle.bind(operation));
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
          this.express.head(this.routePath, middleware, operation.handle);
          break;
        case "patch":
          this.express.patch(this.routePath, middleware, operation.handle);
          break;
        case "trace":
          this.express.trace(this.routePath, middleware, operation.handle);
          break;
        // Begin supporting ExpressJS specific supported methods, even if Swagger doesn't
        case "x-checkout":
          this.express.checkout(this.routePath, middleware, operation.handle);
          break;
        case "x-copy":
          this.express.copy(this.routePath, middleware, operation.handle);
          break;
        case "x-lock":
          this.express.lock(this.routePath, middleware, operation.handle);
          break;
        case "x-merge":
          this.express.merge(this.routePath, middleware, operation.handle);
          break;
        case "x-mkactivity":
          this.express.mkactivity(this.routePath, middleware, operation.handle);
          break;
        case "x-mkcol":
          this.express.mkcol(this.routePath, middleware, operation.handle);
          break;
        case "x-move":
          this.express.move(this.routePath, middleware, operation.handle);
          break;
        case "x-m-search":
          this.express["m-search"](this.routePath, middleware, operation.handle);
          break;
        case "x-notify":
          this.express.notify(this.routePath, middleware, operation.handle);
          break;
        case "x-purge":
          this.express.purge(this.routePath, middleware, operation.handle);
          break;
        case "x-report":
          this.express.report(this.routePath, middleware, operation.handle);
          break;
        case "x-search":
          this.express.search(this.routePath, middleware, operation.handle);
          break;
        case "x-subscribe":
          this.express.subscribe(this.routePath, middleware, operation.handle);
          break;
        case "x-unlock":
          this.express.unlock(this.routePath, middleware, operation.handle);
          break;
        case "x-unsubscribe":
          this.express.unsibscribe(this.routePath, middleware, operation.handle);
          break;
        // Maybe look at other official methods neither don't support?
      }

    }
  }
}

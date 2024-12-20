// Handles an instance of an Operation Object of the OpenAPI Spec
const Env = require("../env.js");
const parameters = require("./parameters.js");

module.exports =
class Operation {
  constructor(operationObj, method, route) {
    this.config = operationObj;
    this.route = route;
    this.method = method;

    this.parameters = {}; // Handled by initialize
    this.initialize();
  }

  initialize() {
    this.parameters = {
      ...this.route.rootParameters,
      ...parameters(this.config.parameters)
    };
  }

  async handle(req, res) {

    if (typeof this.config?.prehandler === "function") {
      // TODO: What do we pass them? What do they return?
      await this.config.prehandler();
    }

    // Lets prep our passable Env
    const env = new Env({
      req: req,
      res: res,
      operation: this,
      server: this.route.server
    });

    // Lets prep our parameters
    for (const paramName in this.parameters) {
      this.parameters[paramName].initialize(req);
    }

    // TODO figure out how we want to handle return data, and returning an endpoint
    // It seems we should move to letting endpoint functions handle returns
    // via helper methods
    // But we should check on the ExpressJS API if there's a way to easily tell
    // if an endpoint has been returned, to help handling here.
    // Or maybe we just dont worry to much from this perspective?
    try {
      await this.config.handler(this.parameters, env);
    } catch(err) {
      this.route.server.log.err(err.toString());
    }

    if (typeof this.config.posthandler === "function") {
      // TODO: What do we pass them? What do they return?
      await this.config.posthandler();
    }

    // TODO: What do we do now? Are we done?
  }
}

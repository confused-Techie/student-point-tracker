const CallStack = require("./callStack.js");

module.exports =
class Env {
  constructor(opts = {}) {
    this._opts = opts;

    this.callstack = new CallStack();
    this.http = {
      req: opts.req,
      res: opts.res
    };
    this.operation = opts.operation; // Data about the object containing the current endpoint

  }

  // Here we should setup all possible methods to expose to the user, as well
  // as find a way to load a configured list of modules to expose as well.
  pass(resp) {
    if (this.operation.route?.["x-responder"]?.pass) {
      // The user has defined behavior for this response
      const statusCode = this.operation.route["x-responder"].pass;
      const respondSpec = this.operation.route.schema.response[statusCode];
      // TODO do the things
    } else {
      // No user defined behavior, lets go with the default
    }
  }

  fail(resp) {
    if (this.operation.route?.["x-responder"]?.fail) {
      // The user has defined behavior for this response
      const statusCode = this.operation.route["x-responder"].fail;
      const respondSpec = this.operation.route.schema.response[statusCode];
      // TODO do the things
    } else {
      // No user defined behavior, lets go with the default
    }
  }
}

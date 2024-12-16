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
    this.route = opts.route; // Data about the object containing the current endpoint

  }

  pass(resp) {
    if (this.route?.["x-responder"]?.pass) {
      // The user has defined behavior for this response
      const statusCode = this.route["x-responder"].pass;
      const respondSpec = this.route.schema.response[statusCode];
      // TODO do the things
    } else {
      // No user defined behavior, lets go with the default
    }
  }

  fail(resp) {
    if (this.route?.["x-responder"])
  }
}

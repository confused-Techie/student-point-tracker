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

  // Generic HTTP Return Status Code Helpers
  pass(resp) {
    if (this.operation.config?.["x-responder"]?.pass) {
      // The user has defined behavior for this response
      const respSpec = this.operation.config["x-responder"].pass;

      return this.respond({
        statusCode: respSpec.statusCode,
        contentType: respSpec.contentType,
        content: resp
      });

    } else {
      // No user defined behavior, lets go with the default OK
      return this.OK(resp);
    }
  }

  fail(resp) {
    if (this.operation.config?.["x-responder"]?.fail) {
      // The user has defined behavior for this response
      const respSpec = this.operation.config["x-responder"].fail;

      return this.respond({
        statusCode: respSpec.statusCode,
        contentType: respSpec.contentType,
        content: resp
      });

    } else {
      // No user defined behavior, lets go with the default "Internal Server Error"
      return this.InternalServerError(resp);
    }
  }

  // A flexible response method being able to many parameters and convert them
  // into a proper response
  respond(opts) {
    // Whie originally this was much more fleshed out.
    // ExpressJS is so skilled in this area, we may be able to just rely on them
    // for now.

    this.http.res.status(opts.statusCode);

    if (opts.contentType) {
      this.http.res.type(opts.contentType);
    }

    if (opts.content) {
      this.http.res.send(opts.content);
    } else {
      this.http.res.send();
    }
  }

  // Specific HTTP Status Code Response Helpers
  OK(resp) {
    return this.respond({
      statusCode: 200,
      content: resp
    });
  }

  BadRequest(resp) {
    return this.respond({
      statusCode: 400,
      content: resp
    });
  }

  InternalServerError(resp) {
    return this.respond({
      statusCode: 500,
      content: resp
    });
  }
}

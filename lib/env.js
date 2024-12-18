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
    if (this.operation.route?.["x-responder"]?.pass) {
      // The user has defined behavior for this response
      const statusCode = this.operation.route["x-responder"].pass;

      return this.respond({
        statusCode: statuscode,
        rawBody: resp
      });

    } else {
      // No user defined behavior, lets go with the default OK
      return this.OK(resp);
    }
  }

  fail(resp) {
    if (this.operation.route?.["x-responder"]?.fail) {
      // The user has defined behavior for this response
      const statusCode = this.operation.route["x-responder"].fail;

      return this.respond({
        statusCode: statusCode,
        rawBody: resp
      });

    } else {
      // No user defined behavior, lets go with the default "Internal Server Error"
      return this.InternalServerError(resp);
    }
  }

  // A flexible response method being able to many parameters and convert them
  // into a proper response
  respond(opts) {
    if (typeof opts.statusCode !== "number") {
      throw "No status code defined in `env.respond` call!";
    }

    const respSpec = this.operation.route?.responses?.[opts.statusCode];

    let bodyData;
    let hasBody = true;

    if (opts.body) {
      // The user has provided a non-raw body, we will assume they want a direct
      // return of this data without modification
      bodyData = opts.body;
    } else if (respSpec && opts.rawBody) {
      // The user has provided a raw body and a response specification
      // We will attempt to match their provided data with their spec then return
    } else if (opts.rawBody && !respSpec) {
      // The user has provided a raw body but no specification.
      // We will return the raw body
      bodyData = opts.body;
    } else {
      // The user seemingly hasn't given us any body data to work with at all.
      // We will just return empty data
      hasBody = false;
    }

    // Now we should be able to return
    this.http.res.status(opts.statusCode);
    
  }

  // Specific HTTP Status Code Response Helpers
  OK(resp) {
    return this.respond({
      statusCode: 200,
      rawBody: resp
    });
  }

  BadRequest(resp) {
    return this.respond({
      statusCode: 400,
      rawBody: resp
    });
  }

  InternalServerError(resp) {
    return this.respond({
      statusCode: 500,
      rawBody: resp
    });
  }
}

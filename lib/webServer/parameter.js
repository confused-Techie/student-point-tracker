
module.exports =
class Parameter {
  constructor(spec) {
    this.spec = spec;
    this.rawValue;
  }

  initialize(req) {
    this.rawValue = this.findParam(req);
  }

  // Expects the `req` object from ExpressJS
  findParam(req) {
    // Lets assign `this.rawValue` based on the location of the parameter
    let paramName = this.spec.name;

    switch(this.spec.in) {
      case "path":
        return req.params[paramName];
      case "query":
        return req.query[paramName];
      case "header":
        return req.headers[paramName];
      case "cookie":
        return req.cookies[paramName];
      default:
        return null;
    }
  }

  parse() {
    // Since I'm not yet confident on our methodology on handling getting and
    // parsing parameter data. Lets just leave it up to the user.

    // Calling parse on the parameter will call whatever parse function you have
    // on this parameter spec
    // Being optionally passed the specification.
    // Meaning this function can still rely on the users original spec
    return this.spec["x-parse"](this.rawValue, this.spec);
  }

}

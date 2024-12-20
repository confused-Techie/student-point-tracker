
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

  // Used to take the `rawValue` and forcefully convert it into whatever our
  // validation specification defines.
  // May produce slightly inaccurate results in some edge cases.
  // Returns `null` if unable to coerce an item.
  coerce() {
    let value = null;

    if (this.spec.hasOwnProperty("schema")) {
      // We will follow JSON Schema's rules for coercion
      if (this.spec.schema.hasOwnProperty("type")) {
        switch(this.spec.schema.type) {
          case "string":
            value = this.coerceString(this.spec.schema);
            break;
          case "number":
            if (typeof this.rawValue === "number") {
              value = this.rawValue;
            } else {
              value = Number(this.rawValue);
            }
            break;
          case "integer":
            value = Number.parseInt(this.rawValue);
            if (isNaN(value)) {
              value = null;
            }
            break;
          case "object":
            // TODO depends somewhat highly on OpenAPI spec style property
            break;
          case "array":
            // TODO depends somewhat highly on OpenAPI spec style property
            break;
          case "boolean":
            if (typeof this.rawValue === "string") {
              if (this.rawValue.toLowerCase() === "true") {
                value = true;
              } else if (this.rawValue.toLowerCase() === "false") {
                value = false;
              }
            }
            break;
          case "null":
            // null values require a string with the value of `"null"`
            if (typeof this.rawValue !== "string" && this.rawValue !== "null") {
              // BUG: Clearly one can see that our default to null for a failing
              // coercion is problematic when the user requests a null value.
              // But still, on a failed validation we assign to null.
              // Not sure how a user might handle this, but also not sure when a
              // user wants this.
              value = null;
            }
            break;
        }
      }

      // With type handled, value should be assigned to something other than `null`
      // Which we can begin handling whittling down on the item to ensure it's
      // what the user expects
      if (value === null) {
        return value;
      }


    }

    return value;
  }

  // Will return true or false if the `rawValue` is valid according to the existing
  // specification
  isValid() {

  }

  // Util Methods
  coerceString(spec) {
    let value = null;

    if (typeof this.rawValue === "string") {
      value = this.rawValue;
    } else {
      value = String(this.rawValue);
    }

    if (spec.hasOwnProperty("minLengh")) {
      if (value.length < spec.minLength) {
        return null;
      }
    }

    if (spec.hasOwnProperty("maxLength")) {
      if (value.length > spec.maxLength) {
        value = value.slice(spec.maxLength);
      }
    }

    return value;
  }

  coerceNumber() {

  }

  coerceInteger() {

  }

  coerceBoolean() {

  }

}

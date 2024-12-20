const Parameter = require("./parameter.js");

module.exports =
function parameters(spec = []) {
  // Expects an array of OpenAPI spec compliant parameter objects
  const params = {};

  for (const param of spec) {
    params[param.name] = new Parameter(param);
  }

  return params;
}

const utils = require("./_utils.js");

module.exports = {
  schema: {},
  query: (req) => {
    const maxLength = 50;
    // For performance on the server, and assumed dimisinishing returns on longer queries
    // this is cut off at 50 characters. As suggested by Digitalone1 in pulsar-edit/pulsar-backend
    const prov = req.query.q;

    if (typeof prov !== "string") {
      return "";
    }

    // Check for any possible path traversal and return empty if present
    // Also trim strings to maxLength
    return utils.pathTraversalAttempt(prov)
      ? ""
      : prov.slice(0, maxLength).trim();
  },
};

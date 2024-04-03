const utils = require("./_utils.js");

module.exports = {
  schema: {},
  query: (req) => {
    // The DB sets a limit of 256 characters on the reason.
    const maxLength = 256;
    const prov = req.query.reason;

    return utils.pathTraversalAttempt(prov)
      ? ""
      : prov.slice(0, maxLength).trim();
  },
};

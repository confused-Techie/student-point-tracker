
function id(req) {
  return req.params.id;
}

function query(req) {
  const maxLength = 50;
  // For performance on the server, and assumed dimisinishing returns on longer queries
  // this is cut off at 50 characters. As suggested by Digitalone1 in pulsar-edit/pulsar-backend
  const prov = req.query.q;

  if (typeof prov !== "string") {
    return "";
  }

  // Check for any possible path traversal and return empty if present
  // Also trim strings to maxLength
  return pathTraversalAttempt(prov) ? "" : prov.slice(0, maxLength).trim();
}

function points(req) {
  const def = 0;
  const prov = req.query.points;

  switch(typeof prov) {
    case "string": {
      const n = parseInt(prov, 10);
      return isNaN(prov) ? def : n;
    }
    case "number":
      return isNaN(prov) ? def : prov;
    default:
      return def;
  }
}

function reason(req) {
  // The DB sets a limit of 256 characters on the reason.
  const maxLength = 256;
  const prov = req.query.reason;

  return pathTraversalAttempt(prov) ? "" : prov.slice(0, maxLength).trim();
}

function page(req) {
  const def = 1;
  const prov = req.query.page;

  switch(typeof prov) {
    case "string": {
      const n = parseInt(prov, 10);
      return isNaN(prov) ? def : n;
    }
    case "number":
      return isNaN(prov) ? def : prov;
    default:
      return def;
  }
}

function user(req) {
  const prov = req.user;

  if (typeof prov !== "object") {
    return {};
  }

  return prov;
}

function duckString(req) {
  // TODO: Follow validation tecnique from here: https://github.com/fairfield-programming/ducks/blob/master/src/DuckStringParser.js
  const prov = req.params.duckString;

  if (typeof prov !== "string") {
    return "";
  }

  return prov;
}

function duckStringQuery(req) {
  // TODO: Use the same logic as above
  const prov = req.query.duckStringQuery;

  if (typeof prov !== "string") {
    return "";
    // Maybe return the default duck instead?
  }

  return prov;
}

function pathTraversalAttempt(data) {
  // This will use several methods to check for the possibility of an attempted path traversal attack.

  // The definitions here are based off GoPage checks.
  // https://github.com/confused-Techie/GoPage/blob/main/src/pkg/universalMethods/universalMethods.go
  // But we leave out any focused on defended against URL Encoded values, since this has already been decoded.
  // const checks = [
  //   /\.{2}\//,   //unixBackNav
  //   /\.{2}\\/,   //unixBackNavReverse
  //   /\.{2}/,     //unixParentCatchAll
  // ];

  // Combine the 3 regex into one: https://regex101.com/r/CgcZev/1
  const check = /\.{2}(?:[/\\])?/;
  return data?.match(check) !== null;
}

module.exports = {
  id,
  query,
  points,
  reason,
  page,
  duckString,
  duckStringQuery,
  user,
};

/**
 * @desc Exposes all functions for the database, while also providing some default
 * behavior to each module
 */

const postgres = require("postgres");
const config = require("../config.js")();
const logger = require("../logger.js");

let sqlStorage;

function getSqlStorageObject() {
  return sqlStorage ??= setupSQL();
}

function setSqlStorageObject(setter) {
  sqlStorage = setter;
}

function setupSQL() {
  if (process.env.PROD_STATUS === "dev") {
    return postgres({
      host: config.DB_HOST,
      username: config.DB_USER,
      database: config.DB_DB,
      port: config.DB_PORT,
    });
  } else {
    return postgres({
      host: config.DB_HOST,
      username: config.DB_USER,
      password: config.DB_PASS,
      database: config.DB_DB,
      port: config.DB_PORT,
    });
  }
}

async function shutdownSQL() {
  if (sqlStorage !== undefined) {
    sqlStorage.end();
    logger.generic("SQL Server Shutdown!", "info");
  }
}

function wrapper(modToUse) {
  // Return this function passing all args based on what module we need to use
  return async (...args) => {
    // Wrapp all function calls in a try catch with a singular error handler
    try {
      // Call the function passing the `sqlStorage` object and other provided params
      return modToUse.exec(getSqlStorageObject(), ...args);
    } catch(err) {
      console.error(`SQL command error: ${err.toString()}`);
      console.error(`Args: ${...args}`);
      console.error(err);
      return {
        ok: false,
        content: err,
        short: "server_error"
      };
    }
  };
}

const exportObj = {
  shutdownSQL: shutdownSQL,
  setupSQL: setupSQL,
  setSqlStorageObject: setSqlStorageObject,
  getSqlStorageObject: getSqlStorageObject
};

// Add all other modules here:
//  - First require only once on startup rather than during the command
//  - Then add the function as the default export of the object key
//  - Then we add the safe value to the object key

const keys = [
  "addPointsToStudent",
  "addStudent",
  "disableStudentByID",
  "getAllStudentIDs",
  "getPointsByStudentID",
  "getPointsByStudentIDByDate",
  "getStudentByID",
  "removePointsFromStudent",
  "removeStudentByID",
  "searchStudent"
];

for (const key of keys) {
  let tmp = require(`./${key}.js`);
  exportObj[key] = wrapper(tmp);
  exportObj[key].safe = tmp.safe;
}

module.exports = exportObj;

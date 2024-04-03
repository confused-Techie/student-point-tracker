const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

function findResourcePath() {
  return process.resourcePath ?? process.env.STP_RESOURCE_PATH ?? "./storage";
}

function getConfigFile() {
  try {
    let data = null;

    let configLoc = findResourcePath();
    let fileContent = fs.readFileSync(path.join(configLoc, "app.yaml"), "utf8");
    data = yaml.load(fileContent);

    return data;
  } catch (err) {
    if (process.env.PROD_STATUS === "dev") {
      console.error(
        `Failed to load app.yaml in non-production env! ${err.toString()}`
      );
      data = {};

      return data;
    } else {
      console.error("Failed to load app.yaml!");
      console.error(err);
      process.exit(1);
    }
  }
}

function getConfig() {
  let data = getConfigFile();

  const findValue = (key, def) => {
    return process.env[key] ?? data[key] ?? def;
  };

  // Now our config is a JavaScript Object
  // And we will now use a custom object here to return all values
  return {
    PORT: findValue("PORT", 8080),
    SERVER_URL: findValue("SERVER_URL", "http://localhost:8080"),
    DB_HOST: findValue("DB_HOST"),
    DB_USER: findValue("DB_USER"),
    DB_PASS: findValue("DB_PASS"),
    DB_DB: findValue("DB_DB"),
    DB_PORT: findValue("DB_PORT"),
    GOOGLE_CLIENT_ID: findValue("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: findValue("GOOGLE_CLIENT_SECRET"),
    RATE_LIMIT_GENERIC: findValue("RATE_LIMIT_GENERIC", 1200),
    PAGINATION_LIMIT: findValue("PAGINATION_LIMIT", 30),
    SITE_NAME: findValue("SITE_NAME"),
    CSV_DELIMITER: findValue("CSV_DELIMITER", ","),
    DOMAIN: findValue("DOMAIN"),
    CACHE_TIME: findValue("CACHE_TIME", 604800),
    POINT_CHIPS: findValue("POINT_CHIPS", []),
    ADMINS: findValue("ADMINS", []),
    TASKS: findValue("TASKS", []),
    SESSION_FILE_STORE_TTL: findValue("SESSION_FILE_STORE_TTL", 3600),
    DEV_LOGIN: findValue("DEV_LOGIN", null),
    DEV_IS_ADMIN: findValue("DEV_IS_ADMIN", false),
    DEV_IS_STUDENT: findValue("DEV_IS_STUDENT", false),
    REQUIRE_LOGIN: findValue("REQUIRE_LOGIN", true),
    REPORT_A_PROBLEM_URL: findValue(
      "REPORT_A_PROBLEM_URL",
      "https://github.com/confused-Techie/student-point-tracker/issues"
    ),
    LOCALE: findValue("LOCALE", "en-US"),
    REDIRECT_STUDENTS: findValue("REDIRECT_STUDENTS", false),
    FOOTER_ITEM_NAME: findValue("FOOTER_ITEM_NAME", false),
    FOOTER_ITEM_LINK: findValue("FOOTER_ITEM_LINK", false),
    STARTUP_DB_CONNECT_RETRY_COUNT: findValue(
      "STARTUP_DB_CONNECT_RETRY_COUNT",
      10
    ),
    STARTUP_DB_CONNECT_RETRY_TIME_MS: findValue(
      "STARTUP_DB_CONNECT_RETRY_TIME_MS",
      1000
    ),
    RESOURCE_PATH: findResourcePath(),
    COLUMNS: findValue("COLUMNS", true),
    UID: findValue("UID", null),
    GID: findValue("GID", null),
  };
}

module.exports = getConfig;

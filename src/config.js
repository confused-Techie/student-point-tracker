const fs = require("fs");
const yaml = require("js-yaml");

function getConfigFile() {
  try {
    let data = null;

    let fileContent = fs.readFileSync("./storage/app.yaml", "utf8");
    data = yaml.load(fileContent);

    return data;
  } catch(err) {
    if (process.env.PROD_STATUS === "dev") {
      console.error(`Failed to load app.yaml in non-production env! ${err.toString()}`);
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

  // Now our config is a JavaScript Object
  // And we will now use a custom object here to return all values
  return {
    PORT: process.env.PORT ?? data.PORT ?? 8080,
    SERVER_URL: process.env.SERVER_URL ?? data.SERVER_URL,
    DB_HOST: process.env.DB_HOST ?? data.DB_HOST,
    DB_USER: process.env.DB_USER ?? data.DB_USER,
    DB_PASS: process.env.DB_PASS ?? data.DB_PASS,
    DB_DB: process.env.DB_DB ?? data.DB_DB,
    DB_PORT: process.env.DB_PORT ?? data.DB_PORT,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ?? data.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ?? data.GOOGLE_CLIENT_SECRET,
    RATE_LIMIT_GENERIC: process.env.RATE_LIMIT_GENERIC ?? data.RATE_LIMIT_GENERIC ?? 1200,
    PAGINATION_LIMIT: process.env.PAGINATION_LIMIT ?? data.PAGINATION_LIMIT ?? 30,
    SITE_NAME: process.env.SITE_NAME ?? data.SITE_NAME,
    CSV_DELIMITER: process.env.CSV_DELIMITER ?? data.CSV_DELIMITER ?? ",",
    DOMAIN: process.env.DOMAIN ?? data.DOMAIN,
    MAX_AGE_DUCKS: process.env.MAX_AGE_DUCKS ?? data.MAX_AGE_DUCKS ?? 604800,
    CACHE_TIME: process.env.CACHE_TIME ?? data.CACHE_TIME ?? 604800,
    POINT_CHIPS: data.POINT_CHIPS ?? [],
    ADMINS: data.ADMINS ?? [],
    TASKS: data.TASKS ?? [],
    SESSION_FILE_STORE_TTL: data.SESSION_FILE_STORE_TTL ?? 3600,
    DEV_LOGIN: data.DEV_LOGIN ?? null,
    DEV_IS_ADMIN: data.DEV_IS_ADMIN ?? false,
    DEV_IS_STUDENT: data.DEV_IS_STUDENT ?? false,
    REQUIRE_LOGIN: process.env.REQUIRE_LOGIN ?? data.REQUIRE_LOGIN ?? true,
    REPORT_A_PROBLEM_URL: data.REPORT_A_PROBLEM_URL ?? "https://github.com/confused-Techie/student-point-tracker/issues"
  };
}

module.exports = getConfig;

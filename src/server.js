const fs = require("fs");
const config = require("./config.js")();
let dbTeardown, database, serve, tasks;

(async () => {
  if (process.env.PROD_STATUS === "dev") {
    // We must complete dev setup steps prior to the rest of our requires
    const dbSetup = require("../node_modules/@databases/pg-test/jest/globalSetup");
    dbTeardown = require("../node_modules/@databases/pg-test/jest/globalTeardown");

    console.log("Server is in Development Mode!");

    await dbSetup();

    // lets take the value made by the test runner databse, and put it where the api server exects.
    const dbUrl = process.env.DATABASE_URL;
    console.log(dbUrl);
    // This gives us something like postgres://test-user@localhost:5432/test-db
    // We then need to map these values to where the API server expects
    const dbUrlReg = /postgres:\/\/([\/\S]+)@([\/\S]+):(\d+)\/([\/\S]+)/;
    const dbUrlParsed = dbUrlReg.exec(dbUrl);

    // set the parsed URl as proper env
    process.env.DB_HOST = dbUrlParsed[2];
    process.env.DB_USER = dbUrlParsed[1];
    process.env.DB_DB = dbUrlParsed[4];
    process.env.DB_PORT = dbUrlParsed[3];
  }

  // We will first preform all db setup prior to starting the rest of the application
  database = require("./database/_export.js");
  await checkDBConnectivity(database);

  if (process.env.PROD_STATUS !== "dev") {
    // Then check if our assets are setup
    await checkForAssets();
  }

  const app = require("./main.js");
  tasks = require("./tasks/tasks.js");

  serve = app.listen(config.PORT, () => {
    console.log(`Server Listening on port ${config.PORT}`);
  });

  await tasks.init();
})();

process.on("SIGTERM", async () => {
  await exterminate("SIGTERM");
});

process.on("SIGINT", async () => {
  await exterminate("SIGINT");
});

async function checkDBConnectivity(db) {
  const delay = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  const retry = async (fn, retries, delayMs) => {
    let attempt = 0;

    while (true) {
      try {
        console.log(
          `Initiated initial DB Connection Attempt ${attempt + 1}/${retries}...`
        );
        return await fn();
      } catch (err) {
        console.log(
          `Attempt ${attempt + 1}/${retries} failed. Retrying in ${delayMs}...`
        );

        if (attempt++ < retries) {
          await delay(delayMs);
        } else {
          console.error(
            `Unable to connect to DB: 'postgres://${config.DB_USER}@${config.DB_HOST}:${config.DB_PORT}/${config.DB_DB}'`
          );
          console.error(err);
          process.exit(1);
        }
      }
    }
  };

  return retry(
    async () => {
      let connectTest = db.setupSQL();
      // We run a command here, doesn't matter what command
      let res = await database.getStudentByID("1");

      if (res.content instanceof Error) {
        throw res.content;
      } else if (!res.ok && res.short === "server_error") {
        // We can't throw on just !res.ok since a "not_found" might be emitted for our made up id
        throw res;
      }

      db.setSqlStorageObject(connectTest);
      return;
    },
    config.STARTUP_DB_CONNECT_RETRY_COUNT,
    config.STARTUP_DB_CONNECT_RETRY_TIME_MS
  );
}

async function checkForAssets() {
  if (!fs.existsSync("./static/site.css")) {
    // Determine if the site.css exists, which is the baseline requirement
    // for all other types of CSS and JS files to exist
    // If it doesn't, lets launch the setup
    const setupAssets = require("../scripts/setup_assets.js");
    await setupAssets();
  }
}

async function exterminate(callee) {
  console.log(`${callee} signal received: Shutting down Server.`);
  await database.shutdownSQL();

  if (process.env.PROD_STATUS === "dev") {
    await dbTeardown();
  }

  if (tasks.SHUTDOWN_TASKS.length > 0) {
    console.log("Executing all registered shutdown tasks.");
    for (let i = 0; i < tasks.SHUTDOWN_TASKS.length; i++) {
      await tasks.executeTask(tasks.SHUTDOWN_TASKS[i]);
    }
  }

  console.log("Exiting...");
  serve.close(() => {
    console.log("HTTP Server Closed");
  });

  process.exit(1);
}

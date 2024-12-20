const Log = require("./log.js");
const Frontend = require("./webServer/frontend.js");

module.exports =
class Server {
  constructor() {
    this.config = {
      port: 8080,
      resourcePath: "./tmp",
      sessionFileStoreTtl: 9000,
      googleClientId: null,
      googleClientSecret: null,
      enableAuthentication: false,
      domain: ""
    };

    this.log = new Log(this);
    this.log.useSendMethod(this.log.console);
    this.log.useSendMethod(this.log.cache);

    this.controllers = require("./controllers.js");
    this.frontend = new Frontend(this);
    this.database;
    this.tasks;
    this.cache;
  }

  async initialize() {
    await this.frontend.initialize();
    this.frontend.route(this.controllers);
  }

  async start() {
    this.frontend.listen(this.config.port);
  }

  async stop() {
    //this.database.stop();
    this.frontend.stop();
  }
}

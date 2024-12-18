const Log = require("./log.js");
const Frontend = require("./frontend.js");

module.exports =
class Server {
  constructor() {
    this.log = new Log(this);
    this.log.useSendMethod(this.log.console);
    this.log.useSendMethod(this.log.cache);

    this.controllers = require("./controllers.js");
    this.frontend = new Frontend(this);
    this.database;
    this.models;
    this.parameters;
    this.tasks;
    this.config;
    this.cache;
    this.auth;
  }

  async initialize() {
    await this.frontend.initialize();
    this.frontend.route(this.controllers);
  }

  async start() {

  }

  async stop() {
    this.database.stop();
  }
}

const Log = require("./log.js");
const Frontend = require("./frontend.js");

module.exports =
class Server {
  constructor() {
    this.log = new Log(this);
    this.log.sendMethods.push(this.log.console);
    this.log.sendMethods.push(this.log.cache);

    this.controllers;
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
  }

  async start() {

  }

  async stop() {
    this.database.stop();
  }
}

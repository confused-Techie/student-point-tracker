const Frontend = require("./frontend.js");

module.exports =
class Server {
  constructor() {
    this.controllers;
    this.frontend = new Frontend(this);
    this.database;
    this.models;
    this.parameters;
    this.tasks;
    this.config;
    this.cache;
    this.auth;
    this.log;
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

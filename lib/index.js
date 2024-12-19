const Server = require("./server.js");
const server = new Server();

(async () => {


  await server.initialize();
  await server.start();
})();

process.on("SIGTERM", async () => {
  await server.stop();
});

process.on("SIGINT", async () => {
  await server.stop();
});

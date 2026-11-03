const { parentPort } = require("node:worker_threads");

parentPort.on("message", () => {
  // Keep the request unanswered to exercise the timeout.
});
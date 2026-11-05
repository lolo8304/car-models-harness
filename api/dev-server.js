// api/dev-server.js
const express = require("express");
import util from "file:./lib/util.js";
export function startDevServer() {
  const app = express();
  import("./mock/server.mock.js") as mockServer;
  return mockServer(app);
}

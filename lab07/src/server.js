// server.js - the only file that opens a port.
// app.js builds the app; this file loads the environment and starts listening.
require("dotenv").config({ quiet: true });

const app = require("./app");

const PORT = Number(process.env.PORT) || 3000;
const ENV = process.env.NODE_ENV || "development";

app.listen(PORT, () => {
  console.log(`Contributors API (${ENV}) listening on http://localhost:${PORT}/api/v1`);
});

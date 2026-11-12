// Tiny JSON-file store for src/data/contributors.json (persistence, as in Lab 06).
const fs = require("fs/promises");
const path = require("path");

const DATA_FILE = path.join(__dirname, "..", "data", "contributors.json");

async function readAll() {
  try {
    const text = await fs.readFile(DATA_FILE, "utf8");
    const list = JSON.parse(text || "[]");
    return Array.isArray(list) ? list : [];
  } catch (err) {
    if (err.code === "ENOENT") return []; // first run: no file yet means no contributors
    throw err; // anything else (bad JSON, permissions) is a real 500 for the error handler
  }
}

// Writes are chained so two requests at once cannot interleave and corrupt the file.
let queue = Promise.resolve();
function writeAll(list) {
  const run = queue.then(async () => {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(list, null, 2) + "\n", "utf8");
  });
  queue = run.catch(() => {}); // a failed write must not block every later write
  return run; // ...but the caller still sees the failure and it becomes a 500
}

module.exports = { readAll, writeAll, DATA_FILE };

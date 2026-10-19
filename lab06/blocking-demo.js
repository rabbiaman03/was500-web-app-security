// blocking-demo.js - Part A: blocking vs non-blocking I/O
// Generate the large file first (do NOT commit it):
//   node -e "require('fs').writeFileSync('big.txt','x'.repeat(80_000_000))"
//
// Run:   node blocking-demo.js          -> async version (fs.readFile)
//        node blocking-demo.js sync     -> sync version  (fs.readFileSync)

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3001;
const BIG_FILE = path.join(__dirname, "big.txt");
const useSync = process.argv[2] === "sync";

const server = http.createServer((req, res) => {
  const started = Date.now();

  if (req.url === "/fast") {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end("fast");
    console.log(`/fast answered in ${Date.now() - started} ms`);
    return;
  }

  if (req.url === "/slow") {
    if (useSync) {
      // Version 1: readFileSync blocks the single JavaScript thread. While this
      // line runs, the event loop cannot pick up ANY other request.
      try {
        let length = 0;
        // Read it several times so the freeze is long enough to observe.
        for (let i = 0; i < 25; i++) {
          length = fs.readFileSync(BIG_FILE, "utf8").length;
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`slow (sync): ${length} characters`);
        console.log(`/slow (sync) answered in ${Date.now() - started} ms`);
      } catch (err) {
        console.error(err);
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end("Server error");
      }
      return;
    }

    // Version 2: fs.readFile hands the work to libuv's thread pool and returns
    // immediately, so the event loop stays free to serve /fast meanwhile.
    let remaining = 25;
    let length = 0;
    const readOnce = () => {
      fs.readFile(BIG_FILE, "utf8", (err, data) => {
        if (err) {
          console.error(err);
          res.writeHead(500, { "Content-Type": "text/plain" });
          res.end("Server error");
          return;
        }
        length = data.length;
        remaining -= 1;
        if (remaining > 0) {
          readOnce();
          return;
        }
        res.writeHead(200, { "Content-Type": "text/plain" });
        res.end(`slow (async): ${length} characters`);
        console.log(`/slow (async) answered in ${Date.now() - started} ms`);
      });
    };
    readOnce();
    return;
  }

  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("Not found");
});

server.listen(PORT, () => {
  console.log(`blocking-demo (${useSync ? "SYNC" : "ASYNC"}) on http://localhost:${PORT}`);
});

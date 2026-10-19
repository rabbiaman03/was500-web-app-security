// debug.js - Part C: corrected /api/join handler
// Wrapped in a tiny server so the fixes can be run and tested:  node debug.js  (port 3002)

const http = require("http");
const fs = require("fs");

const server = http.createServer((req, res) => {
  if (req.url === "/api/join" && req.method === "POST") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk; // Fix 1: accumulate chunks instead of overwriting
    });
    req.on("end", () => {
      let data;
      try {
        data = JSON.parse(body); // Fix 2: guard the parse
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ ok: false, error: "Body is not valid JSON" }));
        return;
      }
      if (!data.email) {
        res.writeHead(400, { "Content-Type": "application/json" }); // Fix 3: 400, not 200
        res.end(JSON.stringify({ ok: false, error: "Email required" }));
        return; // Fix 4: stop here so we never save or respond twice
      }
      fs.readFile("data/contributors.json", (err, file) => {
        let list = [];
        if (err) {
          // Fix 5: check err before touching file
          if (err.code !== "ENOENT") {
            console.error(err);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Server error" }));
            return;
          }
        } else {
          try {
            list = JSON.parse(file);
          } catch (parseErr) {
            console.error(parseErr);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Server error" }));
            return;
          }
        }
        list.push(data);
        fs.mkdir("data", { recursive: true }, (mkdirErr) => {
          if (mkdirErr) {
            console.error(mkdirErr);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: false, error: "Server error" }));
            return;
          }
          fs.writeFile("data/contributors.json", JSON.stringify(list, null, 2), (writeErr) => {
            if (writeErr) {
              console.error(writeErr);
              res.writeHead(500, { "Content-Type": "application/json" });
              res.end(JSON.stringify({ ok: false, error: "Server error" }));
              return;
            }
            res.writeHead(201, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ ok: true }));
          });
        });
      });
    });
    return;
  }
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ ok: false, error: "Not found" }));
});

if (require.main === module) {
  server.listen(3002, () => console.log("debug.js listening on http://localhost:3002"));
}

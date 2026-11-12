// Part A - Middleware order experiment (scratch file).
// Run one of three versions without editing the code:
//   node order-demo.js before   -> express.json() registered BEFORE the route (correct)
//   node order-demo.js after    -> express.json() registered AFTER the route (broken, silently)
//   node order-demo.js nonext   -> a custom middleware that forgets to call next()
const express = require("express");

const mode = process.argv[2] || "before";
const app = express();

if (mode === "before") {
  app.use(express.json()); // parser runs first, so req.body is filled in before the route sees it
}

if (mode === "nonext") {
  app.use(express.json());
  app.use((req, res, next) => {
    console.log(`[forgetful] ${req.method} ${req.url} - logging, but never calling next()`);
    // next();  <-- forgotten on purpose
  });
}

// The route simply echoes back whatever is in req.body.
app.post("/test", (req, res) => {
  res.json({ mode, typeofBody: typeof req.body, body: req.body ?? null });
});

if (mode === "after") {
  app.use(express.json()); // registered too late: the route above already sent the response
}

app.listen(3000, () => console.log(`order-demo (${mode}) listening on http://localhost:3000`));

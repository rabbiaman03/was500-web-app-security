// app.js - builds and exports the Express app. It never calls listen(), so the app
// can be imported by a test runner without opening a port.
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const morgan = require("morgan");
const { rateLimit } = require("express-rate-limit");

const logger = require("./middlewares/logger");
const { notFound, errorHandler } = require("./middlewares/errorHandler");
const { sendError } = require("./utils/responses");
const contributorsRouter = require("./routes/contributors.routes");

const app = express();

// Rate-limit settings come from the environment so the 429 test does not need 100 requests.
const RATE_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const RATE_MAX = Number(process.env.RATE_LIMIT_MAX) || 100;

const limiter = rateLimit({
  windowMs: RATE_WINDOW_MS,
  limit: RATE_MAX,
  standardHeaders: "draft-8", // RateLimit / RateLimit-Policy headers tell the client its budget
  legacyHeaders: false,
  // Use the same failure shape as every other error instead of the library's plain text.
  handler: (req, res) =>
    sendError(res, 429, "Too many requests. Please slow down and try again later.", [
      { limit: RATE_MAX, windowSeconds: Math.round(RATE_WINDOW_MS / 1000) },
    ]),
});

// ---- Middleware stack (order is deliberate) ----
app.use(helmet()); // 1st: security headers must be set on EVERY response, even 404s/429s/errors produced further down
app.use(cors()); // 2nd: answers CORS preflight (OPTIONS) early and adds CORS headers before any route can respond
app.use(morgan("dev")); // 3rd: logs every request that gets this far, including ones the limiter later rejects
app.use(logger); // 4th: my own timing logger - registered early so its timer covers everything below it
app.use("/api", limiter); // 5th: reject floods BEFORE spending CPU on body parsing or touching the data file
app.use(express.json({ limit: "10kb" })); // 6th: parse JSON bodies before the routes that read req.body (Part A)
app.use(express.urlencoded({ extended: true, limit: "10kb" })); // 7th: parse HTML form posts, also before the routes

// ---- Routes ----
app.use("/api/v1/contributors", contributorsRouter); // versioned base path; the router only knows "/" and "/:id"

// ---- Error handling (must be last) ----
app.use(notFound); // after all routes: only reached when nothing above matched
app.use(errorHandler); // 4-argument error middleware: every next(err) ends up here

module.exports = app;

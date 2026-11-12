// Centralised error handling. Controllers never build their own 500 responses;
// they throw (or call next(err)) and the error is formatted here, once.
const { sendError } = require("../utils/responses");

// 404 for any path no router matched - same response shape as every other error.
function notFound(req, res) {
  sendError(res, 404, `Route not found: ${req.method} ${req.originalUrl}`);
}

// Express recognises error middleware by its four-argument signature.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === "production";

  // Malformed JSON from express.json() is the client's fault, not ours.
  if (err.type === "entity.parse.failed") {
    return sendError(res, 400, "Request body is not valid JSON.");
  }
  if (err.type === "entity.too.large") {
    return sendError(res, 413, "Request body is too large.");
  }

  // Errors we created on purpose carry their own status (e.g. 404 from a controller).
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;

  if (status >= 500) {
    console.error("[errorHandler]", err); // full detail always goes to the server log
  }

  // In production a 500 says nothing about the internals; in development it shows the stack.
  const message = status >= 500 && isProduction ? "Internal server error." : err.message || "Internal server error.";
  const details = err.details || [];
  if (!isProduction && status >= 500) {
    details.push({ stack: String(err.stack || "").split("\n").map((line) => line.trim()) });
  }

  return sendError(res, status, message, details);
}

module.exports = { notFound, errorHandler };

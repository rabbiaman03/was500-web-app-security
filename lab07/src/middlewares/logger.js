// Custom request logger: method, path, status and how long the request took.
// The timer starts when the request arrives; the line is printed on the response's
// "finish" event, so the duration covers every middleware and handler that ran.
function logger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[logger] ${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms.toFixed(2)} ms`);
  });

  next(); // hand the request on - without this every request would hang (Part A, 2.6.3)
}

module.exports = logger;

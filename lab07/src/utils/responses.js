// One response shape for the whole API.
//   Success:  { "ok": true,  "data": <payload> }
//   Failure:  { "ok": false, "error": { "message": "...", "details": [...] } }

function sendSuccess(res, status, data) {
  return res.status(status).json({ ok: true, data });
}

function sendError(res, status, message, details = []) {
  return res.status(status).json({ ok: false, error: { message, details } });
}

// 204 means "done, nothing to send" - no body at all, not even the success envelope.
function sendNoContent(res) {
  return res.status(204).end();
}

// Small helper so controllers can raise an error with a status for the central handler.
function httpError(status, message, details = []) {
  const err = new Error(message);
  err.status = status;
  err.details = details;
  return err;
}

module.exports = { sendSuccess, sendError, sendNoContent, httpError };

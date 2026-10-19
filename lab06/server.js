// server.js - Cipher Legends server (Lab 06)
// Node core modules only: http, fs, path, url, querystring.

const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");
const querystring = require("querystring");

const PORT = 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const DATA_DIR = path.join(__dirname, "data");
const CONTRIBUTORS_FILE = path.join(DATA_DIR, "contributors.json");
const MAX_BODY_BYTES = 1e6; // 1 MB is far more than a registration form needs

// One lookup object. Supporting a new file type = adding one line here.
const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
};

const ALLOWED_INTERESTS = [
  "Cryptanalysis",
  "Information Theory",
  "Public-Key Cryptography",
  "Applied Cryptography",
];

const LEGENDS = [
  { name: "Alan Turing", era: "1912–1954", knownFor: "Breaking the Enigma cipher at Bletchley Park", field: "Cryptanalysis" },
  { name: "Claude Shannon", era: "1916–2001", knownFor: "Founding information theory", field: "Information Theory" },
  { name: "Grace Hopper", era: "1906–1992", knownFor: "Compilers, and popularising the term \"debugging\"", field: "Programming Languages" },
  { name: "Elizebeth Smith Friedman", era: "1892–1980", knownFor: "Breaking smuggling and spy ciphers for the US Coast Guard", field: "Cryptanalysis" },
  { name: "Whitfield Diffie", era: "b. 1944", knownFor: "Co-inventing public-key exchange", field: "Public-Key Cryptography" },
  { name: "Martin Hellman", era: "b. 1945", knownFor: "Co-inventing public-key exchange", field: "Public-Key Cryptography" },
];

const ABOUT_HTML = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><title>About - Cipher Legends</title>
<link rel="stylesheet" href="/styles.css"></head>
<body>
<main id="main">
<h1>About the Archive</h1>
<p>Cipher Legends is a small archive of six people whose work made modern cryptography and
computing security possible - from the codebreakers of the Second World War to the inventors of
public-key exchange that secures every HTTPS connection today.</p>
<p>The archive is built as a WAS500 lab project. This page, the legend data at
<a href="/legends">/legends</a>, and the registration endpoint are all served by a hand-written
Node.js server using only core modules - no framework.</p>
<p><a href="/">Back to the legends</a></p>
</main>
</body>
</html>`;

// ---------- Response helpers ----------
function sendJson(res, status, payload) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
}

function sendHtml(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html" });
  res.end(html);
}

function sendNotFound(res, pathname) {
  const safePath = String(pathname).replace(/[<>&"]/g, "");
  sendHtml(
    res,
    404,
    `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>404 Not Found</title></head>
<body><h1>404 - Not Found</h1><p>Nothing in the archive lives at <code>${safePath}</code>.</p>
<p><a href="/">Return to Cipher Legends</a></p></body></html>`
  );
}

// ---------- Static files ----------
function serveStatic(res, pathname) {
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch (err) {
    sendNotFound(res, pathname);
    return;
  }
  const filePath = path.join(PUBLIC_DIR, decoded);

  // Refuse anything that resolves outside public/ (e.g. /../server.js).
  if (!filePath.startsWith(PUBLIC_DIR + path.sep)) {
    sendNotFound(res, pathname);
    return;
  }

  const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()];
  if (!contentType) {
    sendNotFound(res, pathname);
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      // Missing file (or a directory) is the client's mistake -> 404.
      if (err.code === "ENOENT" || err.code === "EISDIR") {
        sendNotFound(res, pathname);
        return;
      }
      // The file exists but could not be read -> our problem -> 500.
      console.error(`Error reading ${filePath}:`, err);
      sendHtml(res, 500, "<h1>500 - Internal Server Error</h1><p>The file could not be read.</p>");
      return;
    }
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

// ---------- Registration ----------
function validateRegistration(data) {
  const fullName = typeof data.fullName === "string" ? data.fullName.trim() : "";
  if (!fullName) return "fullName is required.";
  if (fullName.length < 2) return "fullName must be at least 2 characters after trimming.";

  const email = typeof data.email === "string" ? data.email.trim() : "";
  if (!email) return "email is required.";
  const at = email.indexOf("@");
  if (at < 1 || at === email.length - 1) {
    return "email must contain '@' with text on both sides.";
  }

  const yearRaw = data.yearOfStudy;
  if (yearRaw === undefined || yearRaw === null || String(yearRaw).trim() === "") {
    return "yearOfStudy is required.";
  }
  const year = Number(yearRaw);
  if (!Number.isFinite(year)) return "yearOfStudy must be numeric.";
  if (year < 1 || year > 6) return `yearOfStudy must be between 1 and 6 (received ${yearRaw}).`;

  const interest = typeof data.interest === "string" ? data.interest : "";
  if (!interest) return "interest is required.";
  if (!ALLOWED_INTERESTS.includes(interest)) {
    return `interest must be one of: ${ALLOWED_INTERESTS.join(", ")}.`;
  }
  return "";
}

function readContributors(callback) {
  fs.readFile(CONTRIBUTORS_FILE, "utf8", (err, text) => {
    if (err) {
      // No file yet: treat the current contents as an empty list.
      if (err.code === "ENOENT") {
        callback(null, []);
        return;
      }
      callback(err);
      return;
    }
    try {
      const list = JSON.parse(text);
      callback(null, Array.isArray(list) ? list : []);
    } catch (parseErr) {
      callback(parseErr);
    }
  });
}

function saveContributor(record, callback) {
  fs.mkdir(DATA_DIR, { recursive: true }, (mkdirErr) => {
    if (mkdirErr) {
      callback(mkdirErr);
      return;
    }
    readContributors((readErr, list) => {
      if (readErr) {
        callback(readErr);
        return;
      }
      list.push(record);
      fs.writeFile(CONTRIBUTORS_FILE, JSON.stringify(list, null, 2), "utf8", (writeErr) => {
        callback(writeErr || null);
      });
    });
  });
}

function handleJoin(req, res) {
  const contentType = (req.headers["content-type"] || "").split(";")[0].trim().toLowerCase();
  const isForm = contentType === "application/x-www-form-urlencoded";
  const isJson = contentType === "application/json";

  // Collect the body in pieces: a large POST arrives as several chunks.
  let body = "";
  let tooLarge = false;
  req.on("data", (chunk) => {
    if (tooLarge) return;
    body += chunk;
    if (body.length > MAX_BODY_BYTES) {
      tooLarge = true;
    }
  });

  req.on("error", (err) => {
    console.error("Request stream error:", err);
  });

  req.on("end", () => {
    if (!isForm && !isJson) {
      sendJson(res, 415, {
        ok: false,
        error: `Unsupported Content-Type '${contentType || "none"}'. Use application/x-www-form-urlencoded or application/json.`,
      });
      return;
    }
    if (tooLarge) {
      sendJson(res, 413, { ok: false, error: "Request body is too large." });
      return;
    }

    let data;
    if (isForm) {
      data = querystring.parse(body);
    } else {
      try {
        data = JSON.parse(body);
      } catch (err) {
        console.error("Malformed JSON received:", err.message);
        sendJson(res, 400, { ok: false, error: "Request body is not valid JSON." });
        return;
      }
      if (data === null || typeof data !== "object" || Array.isArray(data)) {
        sendJson(res, 400, { ok: false, error: "JSON body must be an object." });
        return;
      }
    }

    const problem = validateRegistration(data);
    if (problem) {
      sendJson(res, 400, { ok: false, error: problem });
      return;
    }

    // The password is deliberately NOT stored. Even if it arrives in the body we
    // only build the record from the four allowed fields, so it is discarded here.
    // Writing a plaintext password to disk means anyone who can read this file (or
    // a backup of it, or a git commit of it) learns every user's password - and
    // people reuse passwords. Real systems store only a slow salted hash (Week 12).
    const record = {
      fullName: data.fullName.trim(),
      email: data.email.trim(),
      yearOfStudy: Number(data.yearOfStudy),
      interest: data.interest,
      joinedAt: new Date().toISOString(),
    };

    saveContributor(record, (err) => {
      if (err) {
        console.error("Failed to save contributor:", err);
        sendJson(res, 500, { ok: false, error: "Server error" });
        return;
      }
      sendJson(res, 201, { ok: true, message: `Welcome to the archive, ${record.fullName}!` });
    });
  });
}

// ---------- Router ----------
const server = http.createServer((req, res) => {
  // url.URL (WHATWG) needs a base because req.url is only the path part.
  const { pathname } = new url.URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;
  console.log(`${method} ${req.url}`);

  try {
    if (pathname === "/" && method === "GET") {
      fs.readFile(path.join(PUBLIC_DIR, "index.html"), (err, html) => {
        if (err) {
          console.error("Could not read index.html:", err);
          sendHtml(res, 500, "<h1>500 - Internal Server Error</h1>");
          return;
        }
        sendHtml(res, 200, html);
      });
      return;
    }

    if (pathname === "/about" && method === "GET") {
      sendHtml(res, 200, ABOUT_HTML);
      return;
    }

    if (pathname === "/legends" && method === "GET") {
      sendJson(res, 200, LEGENDS);
      return;
    }

    if (pathname === "/api/join" && method === "POST") {
      handleJoin(req, res);
      return;
    }

    if (method === "GET" && path.extname(pathname) !== "") {
      serveStatic(res, pathname);
      return;
    }

    sendNotFound(res, pathname);
  } catch (err) {
    console.error("Unexpected error handling request:", err);
    if (!res.headersSent) {
      sendJson(res, 500, { ok: false, error: "Server error" });
    } else {
      res.end();
    }
  }
});

server.on("clientError", (err, socket) => {
  console.error("Client error:", err.message);
  socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

// Log but never exit: one bad request must not take the server down.
process.on("uncaughtException", (err) => {
  console.error("Uncaught exception (server kept running):", err);
});

server.listen(PORT, () => {
  console.log(`Cipher Legends server running at http://localhost:${PORT}`);
});

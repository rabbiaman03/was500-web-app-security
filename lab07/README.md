# Lab 07 - Express.js and RESTful API Design
- **Author**: Rabbi Muhammad Aman
- **Date**: 2026-11-10

## What I built (summary)

The Lab 06 core-module server **rebuilt as a structured Express REST API** for a `contributors` resource, with security middleware, strict validation and one central error handler.

| Area | What I did |
|---|---|
| **Middleware order** | Moved `express.json()` below the route: `req.body` became `undefined` with a silent **200**. A middleware without `next()` made the request hang with no error |
| **REST design** | Five CRUD endpoints under `/api/v1/contributors` with correct methods and statuses: **201** + `Location` on create, **204** with no body on delete, **404** for unknown ids |
| **Security middleware** | `helmet` security headers, `cors`, and a rate limiter that returns **429** in the API's own JSON shape |
| **Validation at the boundary** | `express-validator` reports **every** failing field at once, trims and normalises input, and **rejects unexpected fields** (no mass assignment of `isAdmin` or `id`) |
| **Query parameters** | Filtering, sorting and pagination, with **400** for `page=0`, `limit=-5` or an unknown sort field |
| **Error handling** | One error middleware, no per-route `500`s. Stack traces are shown in development and **hidden in production** |
| **REST review** | Found what is wrong with five working but badly designed endpoints, including a GET that creates records |

### Run it
```bash
cd lab07
npm install
cp .env.example .env      # then set PORT=3000 and NODE_ENV=development
npm run dev               # or: npm start
node order-demo.js after  # the Part A middleware-order demo (before | after | nonext)
```
Requires Node.js 18+. The API is served at `http://localhost:3000/api/v1/contributors`.

| Validation lists every failure (400) | Rate limit hit (429) | No stack trace in production (500) |
|---|---|---|
| <img src="images/b-post-400-three-fields.png" width="260"> | <img src="images/i-rate-limit-429.png" width="260"> | <img src="images/l-500-production.png" width="260"> |

The full lab report follows below.

---
## Table of Contents
1. [Introduction](#introduction)
2. [Part A - Middleware Order](#part-a---middleware-order)
3. [Part B - The Contributors API](#part-b---the-contributors-api)
4. [Part C - REST Review](#part-c---rest-review)
5. [Code Block Deliverables](#code-block-deliverables)
6. [Screenshots Deliverables](#screenshots-deliverables)
7. [Experience and Challenges](#experience-and-challenges)
---
## Introduction
For this lab, I upgraded the Lab 06 core-module server to be a full-fledged Express API for the `contributors` resource. In Part A, I deliberately broke a small Express app by putting `express.json()` below the route and writing middleware that never calls `next()`, thus demonstrating how middleware forms a pipeline that executes in the order in which it is registered. In Part B, I developed a project structure (`app.js/server.js` separation, routing separated from controllers, `dotenv` configuration), constructed the middleware pipeline in a deliberate way (`helmet`, `cors`, `morgan`, a timing logger, rate limiting, and the body parsers), and developed the five CRUD endpoints under `/api/v1`. The responses are returned in a consistent format of `{ ok, data }`/`{ ok, error }`, the request bodies are checked and sanitized via `express-validator` (all erroneous fields are highlighted and unrecognized fields rejected), the listing endpoint provides functionality of filtering, sorting, and pagination, and all errors go through a single error handler that removes stack traces from production output. Each endpoint was thoroughly tested using `curl` (permitted by the lab rather than Postman). In Part C, I evaluated five endpoints that work but violate REST principles.

### Folder structure
```
lab07/
├─ src/
│  ├─ app.js                              (builds + exports the app, never listens)
│  ├─ server.js                           (loads .env, calls listen)
│  ├─ routes/contributors.routes.js       (WHAT endpoints exist)
│  ├─ controllers/contributors.controller.js (HOW they behave)
│  ├─ middlewares/logger.js               (my own request timer)
│  ├─ middlewares/errorHandler.js         (404 handler + central error handler)
│  ├─ middlewares/validators.js           (express-validator rules + handleValidation)
│  ├─ utils/responses.js                  (the one response shape)
│  ├─ utils/store.js                      (read/write contributors.json)
│  └─ data/contributors.json              (seeded with [])
├─ images/                                (screenshots for this report)
├─ .env                                   (PORT=3000, NODE_ENV=development - NOT committed)
├─ .env.example                           (PORT=, NODE_ENV=)
├─ .gitignore                             (node_modules/ and .env)
├─ order-demo.js
├─ package.json
└─ README.md                              (this report)
```
---
## Part A - Middleware Order

### Deliverable 1: The demo app (2.1)
`order-demo.js` keeps all three versions in one file, so I could switch between them without editing code: `node order-demo.js before`, `node order-demo.js after`, and `node order-demo.js nonext`. The route sends back whatever is in `req.body` along with `typeof req.body`.

```javascript
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

app.post("/test", (req, res) => {
  res.json({ mode, typeofBody: typeof req.body, body: req.body ?? null });
});

if (mode === "after") {
  app.use(express.json()); // registered too late: the route above already sent the response
}
```

### Deliverable 2: Observed results (2.2-2.5)
Same request every time:
```bash
curl -i -X POST http://localhost:3000/test -H "Content-Type: application/json" -d "{\"name\":\"Turing\"}"
```

| Version | Status | Response body |
| --- | --- | --- |
| `express.json()` **before** the route | `200 OK` | `{"mode":"before","typeofBody":"object","body":{"name":"Turing"}}` |
| `express.json()` **after** the route | `200 OK` | `{"mode":"after","typeofBody":"undefined","body":null}` |
| custom middleware **without `next()`** | no response | `curl: (28) Operation timed out after 10012 milliseconds with 0 bytes received` |

### Deliverable 3: Answers (2.6)
**2.6.1** In the second example, the `req.body` object was `undefined` (because Express 5 does not define this object unless a middleware has run; in Express 4, it would be an empty object `{}`). So my route simply returned `null`, since there were no errors reported by Express. Why? Because in my case, the route was supposed to read a property that wasn't defined and return a valid JSON response with a status code `200`.

**2.6.2** The request will pass through middleware/routes exactly in the same order in which they were defined using `app.use()`/`app.get()`/`app.post()`. Every middleware can read or manipulate `req`/`res` and then can either terminate the request with a response or continue passing the control with `next()`. The request ends when `/test` handler uses `res.json()`; hence it will never call `next()`, and anything registered after that route will never get called, including the JSON parser. That is why parsers, security headers and loggers should always be defined before their respective routes.

**2.6.3** I expected it to hang since Express doesn't have a way of knowing whether the middleware completed its job except when it either responds or invokes the next function. Indeed, it hung as evident from the server message that read `[forgetful] POST /test - logging, but never calling next()`; the route was not invoked and curl did not receive any data for 10 seconds before timing out (exit code 28). There were no errors and no crashes, only an open connection.

---
## Part B - The Contributors API

### Project setup (2.7-2.11)
```bash
npm init -y
npm i express cors helmet morgan express-validator dotenv express-rate-limit
npm i -D nodemon
```
Installed versions: `express@5.3.0`, `cors@2.8.6`, `helmet@8.3.0`, `morgan@1.12.1`, `express-validator@7.3.2`, `dotenv@18.0.10`, `express-rate-limit@8.7.4`, `nodemon@3.1.14` (dev). Scripts in `package.json`:

```json
"scripts": {
  "start": "node src/server.js",
  "dev": "nodemon src/server.js"
}
```
`.gitignore` contains `node_modules/` and `.env`. `.env` has `PORT=3000` and `NODE_ENV=development`, and the committed `.env.example` has the same keys with empty values. `app.js` builds and exports the app; `server.js` is the only file that calls `require("dotenv").config()` and `app.listen()`, so the app can be imported by a test without opening a port. Both `npm start` and `npm run dev` were tested (screenshots 4, 5, 6).

### Middleware stack (2.12-2.13)
From `src/app.js`. I put the rate limiter before the body parsers rather than last in the list: the limiter does not need the body, so rejecting a flood before parsing it saves work.

```javascript
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
```

My custom logger (`src/middlewares/logger.js`) starts a timer when the request comes in and prints the line on the response's `finish` event, so the time covers every middleware and handler that ran:

```javascript
function logger(req, res, next) {
  const start = process.hrtime.bigint();

  res.on("finish", () => {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`[logger] ${req.method} ${req.originalUrl} -> ${res.statusCode} in ${ms.toFixed(2)} ms`);
  });

  next(); // hand the request on - without this every request would hang (Part A, 2.6.3)
}
```
Sample output: `[logger] POST /api/v1/contributors -> 201 in 7.10 ms`.

### Answer 2.14 - helmet and the rate limiter
The `helmet` plugin helps define the response headers that instruct the browser to be more cautious about what we return: `Content-Security-Policy` restricts the locations where scripts can come from (mitigates XSS attacks), `X-Frame-Options`, `frame-ancestors` mitigate clickjacking, `X-Content-Type-Options: nosniff` blocks MIME sniffing, and `Strict-Transport-Security` mandates HTTPS. The rate limiter defines the number of requests that the client (IP) can make during a certain time frame, thus reducing the brute force guessing, scraping, and request flood attacks that would otherwise exhaust the server resources. However, both methods do not protect against the attack that comes in a valid, correctly formed request during this window period, such as a stored XSS or injection attack inside the `fullName`, and the rate limiter will not protect against distributed DDoS from a thousand different IPs.

### REST endpoints (2.15-2.17)
`src/routes/contributors.routes.js` only says which endpoints exist and which checks run first; all logic lives in `src/controllers/contributors.controller.js`:

```javascript
router
  .route("/")
  .get(listQuery, handleValidation, controller.list) // GET    /api/v1/contributors
  .post(contributorBody, handleValidation, controller.create); // POST   /api/v1/contributors

router
  .route("/:id")
  .get(idParam, handleValidation, controller.getById) // GET    /api/v1/contributors/:id
  .put(idParam, contributorBody, handleValidation, controller.replace) // PUT    /api/v1/contributors/:id
  .delete(idParam, handleValidation, controller.remove); // DELETE /api/v1/contributors/:id
```

| Method | Path | Controller | Success status |
| --- | --- | --- | --- |
| GET | `/api/v1/contributors` | `list` | 200 |
| GET | `/api/v1/contributors/:id` | `getById` | 200 |
| POST | `/api/v1/contributors` | `create` | 201 (+ `Location` header) |
| PUT | `/api/v1/contributors/:id` | `replace` | 200 |
| DELETE | `/api/v1/contributors/:id` | `remove` | 204 (no body) |

Data is persisted to `src/data/contributors.json` through `src/utils/store.js` (`fs/promises`). Writes are chained in a small queue so two requests at the same time cannot overwrite each other. The server generates the `id` (`crypto.randomUUID()`) and `joinedAt`; PUT keeps both and adds `updatedAt`.

### Answer 2.18 - 201 and 204
`201 Created` tells the client that a new resource now exists, not just that the request worked, and together with the `Location` header it tells the client where to find it, so a client or cache can treat it differently from a plain read. `204 No Content` tells the client the delete succeeded and that there is deliberately no body to parse, so the client should not try to read JSON from it; a `200` would imply that a body is coming.

### Consistent responses (2.19-2.20)
`src/utils/responses.js` defines the shape once and everything else uses it:
```javascript
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
```
Even the rate limiter (429) and the 404 handler use `sendError`, so a client can always check `ok` first.

| Situation | Status | Verified in |
| --- | --- | --- |
| Fetched / updated | 200 | tests c, d, e, g |
| Created | 201 | test a |
| Deleted | 204, no body | test h |
| Validation failed | 400 | test b, unexpected fields, invalid query, malformed JSON |
| Id not found | 404 | test f, second DELETE of the same id |
| Rate limit exceeded | 429 | test i |
| Unexpected failure | 500 | corrupted data file test (dev and production) |

### Validation and sanitisation (2.21-2.24)
`src/middlewares/validators.js` uses the same rules as Lab 06. All chains run (no early exit between fields), so one response lists every failing field:

```javascript
body("fullName")
  .exists({ values: "falsy" }).withMessage("fullName is required.").bail()
  .isString().withMessage("fullName must be a string.").bail()
  .trim()
  .isLength({ min: 2, max: 100 }).withMessage("fullName must be 2-100 characters after trimming.")
  .escape(),
body("email")
  .exists({ values: "falsy" }).withMessage("email is required.").bail()
  .isString().withMessage("email must be a string.").bail()
  .trim()
  .isEmail().withMessage("email must be a valid email address.").bail()
  .normalizeEmail({ gmail_remove_dots: false }),
body("yearOfStudy")
  .exists({ values: "null" }).withMessage("yearOfStudy is required.").bail()
  .isInt({ min: 1, max: 6, allow_leading_zeroes: false }).withMessage("yearOfStudy must be an integer from 1 to 6.")
  .toInt(),
body("interest")
  .exists({ values: "falsy" }).withMessage("interest is required.").bail()
  .isString().withMessage("interest must be a string.").bail()
  .trim()
  .isIn(ALLOWED_INTERESTS).withMessage(`interest must be one of: ${ALLOWED_INTERESTS.join(", ")}.`),
```
Test a shows the sanitisation working: `"  Alan Turing "` was stored as `"Alan Turing"` and `Alan.Turing@MySeneca.CA` as `alan.turing@myseneca.ca`.

**Unexpected fields (2.24).** I handle this in two layers. First, a custom `body()` check rejects the request with `400` and names every field that is not one of `fullName`, `email`, `yearOfStudy`, `interest` (screenshot b2: `isAdmin` and `id` were rejected). Second, the controller only stores values from `matchedData()`, so even if the check were removed, an unknown field could never reach the file.

If I blindly saved whatever arrived, this is what could go wrong:
- **Mass assignment** - a client could send `"isAdmin": true`, `"role": "owner"`, or its own `"id"`/`"joinedAt"` and overwrite fields only the server should control (e.g. pick an id that collides with another record).
- **Storage abuse** - huge or deeply nested extra properties could fill the JSON file and slow every read.
- **Stored XSS / bad data** - unvalidated fields bypass every rule above and would later be rendered or trusted by other code.
- **Leaks later** - anything saved is returned by GET, so a client could plant data that other users then receive.

### Filtering, sorting, pagination (2.25-2.27)
Query parameters are validated with `query()` chains before the controller runs. Defaults are `sort=joinedAt`, `order=asc`, `page=1`, `limit=10`. Unknown query parameters, `page` < 1, `limit` outside 1-100, an unknown `sort` field or an `order` other than `asc`/`desc` all return **400**. The response carries pagination state next to the items:
```json
"pagination": { "page": 1, "limit": 3, "total": 7, "totalPages": 3, "hasNext": true, "hasPrev": false },
"filters": { "interest": null },
"sort": { "field": "joinedAt", "order": "asc" }
```

### Centralised error handling (2.28-2.31)
`src/middlewares/errorHandler.js` exports a 404 handler and a four-argument error middleware, both registered after the routes. No controller contains `res.status(500)`: the controllers are `async`, and Express 5 forwards any rejected promise to `next(err)` automatically; when a controller needs a 404 it throws `httpError(404, ...)`.

```javascript
function errorHandler(err, req, res, next) {
  const isProduction = process.env.NODE_ENV === "production";

  if (err.type === "entity.parse.failed") {
    return sendError(res, 400, "Request body is not valid JSON.");
  }
  if (err.type === "entity.too.large") {
    return sendError(res, 413, "Request body is too large.");
  }

  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;

  if (status >= 500) {
    console.error("[errorHandler]", err); // full detail always goes to the server log
  }

  const message = status >= 500 && isProduction ? "Internal server error." : err.message || "Internal server error.";
  const details = err.details || [];
  if (!isProduction && status >= 500) {
    details.push({ stack: String(err.stack || "").split("\n").map((line) => line.trim()) });
  }

  return sendError(res, status, message, details);
}
```

To test the 500 path I deliberately corrupted `contributors.json` and called the list endpoint in both modes (screenshots k and l):
- `NODE_ENV=development` -> `500` with the real message and stack trace, including the full file paths of `store.js` and the controller on my machine.
- `NODE_ENV=production` -> `500` with only `{"ok":false,"error":{"message":"Internal server error.","details":[]}}`. The full stack is still printed in the server log.

**Why this matters:** a stack trace is a free map of the server for an attacker. My development response showed the Windows username, the full folder layout, file names and line numbers, and the fact the data is a JSON file read with `JSON.parse`. Other errors could reveal library versions, SQL queries or config values. In development that detail saves time debugging; in production it should only go to the log the developers can read, while the client just gets a generic message.

---
## Part C - REST Review

### Deliverable: Violations and fixes (2.34)
| # | Endpoint as given | Principle it violates | What it should be |
| --- | --- | --- | --- |
| 1 | `GET /api/v1/getAllContributors` | URLs should name **resources (nouns)**, not actions. The verb `getAll` repeats what the GET method already says, and the camelCase action name is not a collection. | `GET /api/v1/contributors` -> `200` |
| 2 | `GET /api/v1/contributor/delete/:id` | The **method must match the intent**: a GET must be safe and never change data, but this deletes. It also puts a verb (`delete`) in the URL and uses a singular collection name. | `DELETE /api/v1/contributors/:id` -> `204` (or `404` if it does not exist) |
| 3 | `POST /api/v1/contributors/update/:id` | Verb in the URL and the **wrong method**: POST means "create in this collection" and is not idempotent. Updating an existing resource is PUT (full replace) or PATCH (partial). | `PUT /api/v1/contributors/:id` (or `PATCH`) -> `200` with the updated record |
| 4 | `GET /api/v1/contributors?action=create&name=Turing` | Creating with **GET** breaks method safety, and putting the action and the data in the **query string** turns the URL into an RPC call. The data belongs in a request body. | `POST /api/v1/contributors` with a JSON body `{ "fullName": "Turing", ... }` -> `201` + `Location` |
| 5 | `POST /api/v1/contributors` -> `200 { "result": "ok" }` | The URL and method are right, but the **status code does not describe the outcome** (a creation is `201 Created`) and the body does not return the created resource or its id, so the client cannot find what it just made. It also breaks the API's consistent response shape. | `201 Created`, `Location: /api/v1/contributors/<id>`, body `{ "ok": true, "data": { "id": "...", ... } }` |

### Answer 2.35 - creating a record with GET
HTTP defines GET as **safe and idempotent**, and everything between the user and the server is built on that assumption. Browsers and "smart" tools prefetch links (Chrome speculative prefetch, link-preview bots in Slack/Teams/email scanners, search engine crawlers), so just viewing a page that contains `/api/v1/contributors?action=create&name=Turing` can create a record without anyone clicking it, and every crawler visit creates another one. Browsers also retry GET requests on network errors and replay them on refresh/back without the "Confirm form resubmission" warning they show for POST, causing duplicates. Proxies and CDNs may cache the GET response, so a second real create might be answered from the cache and never reach the server at all. It also leaks the submitted data into browser history, server access logs and `Referer` headers, and makes CSRF trivial because an `<img src="...">` tag on any website can trigger it.

---
## Code Block Deliverables

### Deliverable 1: Node and npm versions
```bash
# Command executed
node -v
npm -v
```
**Output**:
```bash
v26.13.0
11.20.0
```

### Deliverable 2: Part A - parser before the route
```bash
# Command executed
node order-demo.js before
curl -i -X POST http://localhost:3000/test -H "Content-Type: application/json" -d "{\"name\":\"Turing\"}"
```
**Output**:
```bash
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 64

{"mode":"before","typeofBody":"object","body":{"name":"Turing"}}
```

### Deliverable 3: Part A - parser after the route
```bash
# Command executed
node order-demo.js after
curl -i -X POST http://localhost:3000/test -H "Content-Type: application/json" -d "{\"name\":\"Turing\"}"
```
**Output**:
```bash
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 53

{"mode":"after","typeofBody":"undefined","body":null}
```

### Deliverable 4: Part A - middleware that forgets `next()`
```bash
# Command executed
node order-demo.js nonext
curl -i --max-time 10 -X POST http://localhost:3000/test -H "Content-Type: application/json" -d "{\"name\":\"Turing\"}"
```
**Output**:
```bash
# server
order-demo (nonext) listening on http://localhost:3000
[forgetful] POST /test - logging, but never calling next()
# client
curl: (28) Operation timed out after 10012 milliseconds with 0 bytes received
```

### Deliverable 5: API test run (2.32-2.33)
Response headers are trimmed to the status line here; the full headers (including all the `helmet` and `RateLimit` headers) are in the screenshots.

```bash
# a - POST a valid contributor
curl -i -X POST http://localhost:3000/api/v1/contributors -H "Content-Type: application/json" -d "{\"fullName\":\"  Alan Turing \",\"email\":\"Alan.Turing@MySeneca.CA\",\"yearOfStudy\":3,\"interest\":\"Cryptanalysis\"}"
```
**Output**:
```bash
HTTP/1.1 201 Created
Location: /api/v1/contributors/9160c9c1-d0a0-4b23-bd00-d10bd28dda24
{"ok":true,"data":{"id":"9160c9c1-d0a0-4b23-bd00-d10bd28dda24","fullName":"Alan Turing","email":"alan.turing@myseneca.ca","yearOfStudy":3,"interest":"Cryptanalysis","joinedAt":"2026-11-10T20:25:26.873Z"}}
```

```bash
# b - POST with three invalid fields
curl -i -X POST http://localhost:3000/api/v1/contributors -H "Content-Type: application/json" -d "{\"fullName\":\"A\",\"email\":\"not-an-email\",\"yearOfStudy\":9,\"interest\":\"Cryptanalysis\"}"
```
**Output**:
```bash
HTTP/1.1 400 Bad Request
{"ok":false,"error":{"message":"Validation failed.","details":[{"field":"fullName","location":"body","message":"fullName must be 2-100 characters after trimming."},{"field":"email","location":"body","message":"email must be a valid email address."},{"field":"yearOfStudy","location":"body","message":"yearOfStudy must be an integer from 1 to 6."}]}}
```

```bash
# b2 - POST with unexpected fields
curl -i -X POST http://localhost:3000/api/v1/contributors -H "Content-Type: application/json" -d "{\"fullName\":\"Eve\",\"email\":\"eve@myseneca.ca\",\"yearOfStudy\":2,\"interest\":\"Cryptanalysis\",\"isAdmin\":true,\"id\":\"hacked\"}"
```
**Output**:
```bash
HTTP/1.1 400 Bad Request
{"ok":false,"error":{"message":"Validation failed.","details":[{"field":"(body)","location":"body","message":"Unexpected field(s): isAdmin, id. Allowed: fullName, email, yearOfStudy, interest."}]}}
```

```bash
# c - GET the list with pagination (7 contributors seeded)
curl -i "http://localhost:3000/api/v1/contributors?page=1&limit=3"
curl -i "http://localhost:3000/api/v1/contributors?page=2&limit=5"
```
**Output**:
```bash
HTTP/1.1 200 OK
... 3 items (Alan Turing, Claude Shannon, Whitfield Diffie) ...
"pagination":{"page":1,"limit":3,"total":7,"totalPages":3,"hasNext":true,"hasPrev":false}

HTTP/1.1 200 OK
... 2 items (Marian Rejewski, Ralph Merkle) ...
"pagination":{"page":2,"limit":5,"total":7,"totalPages":2,"hasNext":false,"hasPrev":true}
```

```bash
# d - filter by interest
curl -i "http://localhost:3000/api/v1/contributors?interest=Cryptanalysis"
```
**Output**:
```bash
HTTP/1.1 200 OK
... 3 items: Alan Turing, Elizebeth Friedman, Marian Rejewski (all "Cryptanalysis") ...
"pagination":{"page":1,"limit":10,"total":3,"totalPages":1,"hasNext":false,"hasPrev":false},"filters":{"interest":"Cryptanalysis"}
```

```bash
# e - sort by fullName descending
curl -i "http://localhost:3000/api/v1/contributors?sort=fullName&order=desc"
```
**Output**:
```bash
HTTP/1.1 200 OK
... Whitfield Diffie, Ralph Merkle, Marian Rejewski, Elizebeth Friedman, Claude Shannon, Bruce Schneier, Alan Turing ...
"sort":{"field":"fullName","order":"desc"}
```

```bash
# e2 - invalid query values
curl -i "http://localhost:3000/api/v1/contributors?page=0&limit=-5&sort=password"
```
**Output**:
```bash
HTTP/1.1 400 Bad Request
{"ok":false,"error":{"message":"Validation failed.","details":[{"field":"sort","location":"query","message":"sort must be one of: fullName, email, yearOfStudy, interest, joinedAt."},{"field":"page","location":"query","message":"page must be an integer of 1 or more."},{"field":"limit","location":"query","message":"limit must be an integer from 1 to 100."}]}}
```

```bash
# f - GET a missing id
curl -i http://localhost:3000/api/v1/contributors/3f2b9c1e-7a4d-4e8b-9c2a-000000000000
```
**Output**:
```bash
HTTP/1.1 404 Not Found
{"ok":false,"error":{"message":"Contributor not found: 3f2b9c1e-7a4d-4e8b-9c2a-000000000000","details":[{"field":"id","location":"params","value":"3f2b9c1e-7a4d-4e8b-9c2a-000000000000"}]}}
```

```bash
# g - PUT an existing contributor
curl -i -X PUT http://localhost:3000/api/v1/contributors/2f1a1176-4afb-475a-b032-452450272c81 -H "Content-Type: application/json" -d "{\"fullName\":\"Claude E. Shannon\",\"email\":\"c.shannon@myseneca.ca\",\"yearOfStudy\":5,\"interest\":\"Information Theory\"}"
```
**Output**:
```bash
HTTP/1.1 200 OK
{"ok":true,"data":{"id":"2f1a1176-4afb-475a-b032-452450272c81","fullName":"Claude E. Shannon","email":"c.shannon@myseneca.ca","yearOfStudy":5,"interest":"Information Theory","joinedAt":"2026-11-10T20:25:27.020Z","updatedAt":"2026-11-10T20:25:29.051Z"}}
```

```bash
# h - DELETE an existing contributor, then the same id again
curl -i -X DELETE http://localhost:3000/api/v1/contributors/0888829d-507b-489d-824e-1ef4d7bf59e1
curl -i -X DELETE http://localhost:3000/api/v1/contributors/0888829d-507b-489d-824e-1ef4d7bf59e1
```
**Output**:
```bash
HTTP/1.1 204 No Content
(no Content-Type, no body)

HTTP/1.1 404 Not Found
{"ok":false,"error":{"message":"Contributor not found: 0888829d-507b-489d-824e-1ef4d7bf59e1","details":[...]}}
```

```bash
# i - exceed the rate limit (server started with RATE_LIMIT_MAX=5, RATE_LIMIT_WINDOW_MS=60000)
for i in 1 2 3 4 5 6 7; do curl -s -o /dev/null -w "request $i -> %{http_code}\n" http://localhost:3000/api/v1/contributors; done
```
**Output**:
```bash
request 1 -> 200
request 2 -> 200
request 3 -> 200
request 4 -> 200
request 5 -> 200
request 6 -> 429
request 7 -> 429
HTTP/1.1 429 Too Many Requests
Retry-After: 60
{"ok":false,"error":{"message":"Too many requests. Please slow down and try again later.","details":[{"limit":5,"windowSeconds":60}]}}
```
The normal limit is 100 requests per 15 minutes. I made both values configurable through environment variables only so this test did not need 100 requests.

```bash
# j - unmatched path, plus malformed JSON
curl -i http://localhost:3000/api/v1/legends
curl -i -X POST http://localhost:3000/api/v1/contributors -H "Content-Type: application/json" -d "{\"fullName\": \"Ada\","
```
**Output**:
```bash
HTTP/1.1 404 Not Found
{"ok":false,"error":{"message":"Route not found: GET /api/v1/legends","details":[]}}

HTTP/1.1 400 Bad Request
{"ok":false,"error":{"message":"Request body is not valid JSON.","details":[]}}
```

```bash
# 500 - data file corrupted on purpose, production vs development
curl -s -w "\nHTTP %{http_code}\n" http://localhost:3000/api/v1/contributors
```
**Output**:
```bash
# NODE_ENV=production
{"ok":false,"error":{"message":"Internal server error.","details":[]}}
HTTP 500
# NODE_ENV=development
{"ok":false,"error":{"message":"Unexpected end of JSON input","details":[{"stack":["SyntaxError: Unexpected end of JSON input","at JSON.parse (<anonymous>)","at readAll (...\\lab07\\src\\utils\\store.js:10:23)","at async list (...\\lab07\\src\\controllers\\contributors.controller.js:25:15)"]}]}}
HTTP 500
```

---
## Screenshots Deliverables

### 1. Part A - `express.json()` before the route (body parsed)
![express.json before the route](images/01-order-before.png)

### 2. Part A - `express.json()` after the route (`req.body` undefined, still 200)
![express.json after the route](images/02-order-after.png)

### 3. Part A - middleware that never calls `next()` (request hangs)
![middleware without next](images/03-order-no-next.png)

### 4. Project structure, `.gitignore`, `.env.example`, scripts and dependencies
![project structure](images/04-project-structure.png)

### 5. `npm run dev` with nodemon
![npm run dev](images/05-npm-run-dev.png)

### 6. Server log during the test run (`morgan` + my custom logger)
![server log](images/06-server-log.png)

### a. POST a valid contributor -> 201 with the created record
![test a](images/a-post-201.png)

### b. POST with three invalid fields -> 400 listing all three
![test b](images/b-post-400-three-fields.png)

### b2. POST with unexpected fields -> 400
![unexpected fields](images/b2-post-400-unexpected-fields.png)

### c. GET the list -> 200 with pagination info
![test c](images/c-get-list-pagination.png)

### d. GET with `?interest=` filter -> only matching records
![test d](images/d-get-filter-interest.png)

### e. GET with `?sort=fullName&order=desc` -> correctly ordered
![test e](images/e-get-sort-desc.png)

### e2. Invalid query values -> 400
![invalid query](images/e2-get-invalid-query-400.png)

### f. GET a missing id -> 404 (and an existing id -> 200)
![test f](images/f-get-missing-id-404.png)

### g. PUT an existing contributor -> 200 with the updated record
![test g](images/g-put-200.png)

### h. DELETE an existing contributor -> 204 with no body (second DELETE -> 404)
![test h](images/h-delete-204.png)

### i. Exceed the rate limit -> 429
![test i](images/i-rate-limit-429.png)

### j. GET an unmatched path -> 404 in the standard error shape (plus malformed JSON -> 400)
![test j](images/j-unmatched-404.png)

### k. Unexpected failure in development -> 500 with stack trace
![500 development](images/k-500-development.png)

### l. Same failure in production -> 500 with no internal detail
![500 production](images/l-500-production.png)

---
## Experience and Challenges
### Reflection on Completing the Lab
- **What did you learn?** Part A was the most helpful part since changing one line caused `req.body` to become `undefined` with `200` and forgetting to use `next()` made the request hang but not give an error. This clearly showed that Express is merely an ordered set of functions and that most Express errors are ordering issues, not syntax errors. In comparison to Lab 06, there was less boilerplate (chunk reading, parsing two content types, routing manually), which enabled the design of the API to become the focus of the lab (method and status code choice by meaning: 201 + `Location`, 204 without the body; one response shape across the board; validation at the border and refusing unknown fields). Part C proved that an API could be perfect yet wrong, particularly the GET creating data, which could be triggered by crawlers/prefetchers on its own.
- **Challenges Faced**: Node.js was not installed on the computer, thus nothing would work initially. The version of Node.js that was installed is Express 5, while some examples used in the lab expect Express 4 (e.g. `req.body` would be `undefined` rather than `{}` without a body parser, and handling async errors is different). The test for rate limiting required more than 100 requests with default parameters. The use of `express-validator` to make it log all errors, and also to reject non-specified fields, required some efforts on my part, and I had to find a way to create a real 500 error.
- **How You Overcame Challenges**: Node.js LTS was installed using `winget`, and then checked using `node -v` / `npm -v`. As for Express 5, I used its capability to forward the rejected promise of an `async` controller to the error handler as described in the "no per-route 500" rule, and the result was captured in Part A (`undefined`). The rate limit window and maximum were both configurable using environment variables and the server was started using `RATE_LIMIT_MAX=5` for test i only. Each rule has its own chain with `.bail()` only inside a field, a custom `body()` check for unknown fields, and `matchedData()` was kept. To check the 500 test, I corrupted `contributors.json` and did the request using `NODE_ENV=development` and `NODE_ENV=production`, and then reverted the file back to normal. `curl -i` was used instead of Postman as it is allowed in the lab.

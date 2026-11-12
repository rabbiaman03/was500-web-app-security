// Controllers say HOW each endpoint behaves. They never send a 500 themselves:
// Express 5 forwards any rejected promise from an async handler to next(err),
// and the central errorHandler formats it.
const crypto = require("crypto");
const { matchedData } = require("express-validator");
const { readAll, writeAll } = require("../utils/store");
const { sendSuccess, sendNoContent, httpError } = require("../utils/responses");

// Only the four validated fields ever reach storage - matchedData() drops everything else.
function pickContributor(req) {
  const { fullName, email, yearOfStudy, interest } = matchedData(req, { locations: ["body"] });
  return { fullName, email, yearOfStudy, interest };
}

function notFound(id) {
  return httpError(404, `Contributor not found: ${id}`, [{ field: "id", location: "params", value: id }]);
}

// GET /api/v1/contributors?interest=&sort=&order=&page=&limit=
async function list(req, res) {
  const { interest, sort = "joinedAt", order = "asc", page = 1, limit = 10 } = matchedData(req, {
    locations: ["query"],
  });

  let items = await readAll();

  if (interest) items = items.filter((c) => c.interest === interest);

  const direction = order === "desc" ? -1 : 1;
  items.sort((a, b) => {
    const x = a[sort];
    const y = b[sort];
    if (typeof x === "number" && typeof y === "number") return (x - y) * direction;
    return String(x).localeCompare(String(y), "en", { sensitivity: "base" }) * direction;
  });

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;

  return sendSuccess(res, 200, {
    items: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages, hasNext: page < totalPages, hasPrev: page > 1 },
    filters: { interest: interest || null },
    sort: { field: sort, order },
  });
}

// GET /api/v1/contributors/:id
async function getById(req, res) {
  const items = await readAll();
  const found = items.find((c) => c.id === req.params.id);
  if (!found) throw notFound(req.params.id);
  return sendSuccess(res, 200, found);
}

// POST /api/v1/contributors
async function create(req, res) {
  const items = await readAll();
  const record = {
    id: crypto.randomUUID(), // the server owns the id - clients cannot choose it
    ...pickContributor(req),
    joinedAt: new Date().toISOString(),
  };
  items.push(record);
  await writeAll(items);
  res.location(`${req.baseUrl}/${record.id}`); // 201 + Location: where the new resource lives
  return sendSuccess(res, 201, record);
}

// PUT /api/v1/contributors/:id - full replacement of the editable fields
async function replace(req, res) {
  const items = await readAll();
  const index = items.findIndex((c) => c.id === req.params.id);
  if (index === -1) throw notFound(req.params.id);

  const existing = items[index];
  const updated = {
    id: existing.id, // id and joinedAt are server-managed and survive a replace
    ...pickContributor(req),
    joinedAt: existing.joinedAt,
    updatedAt: new Date().toISOString(),
  };
  items[index] = updated;
  await writeAll(items);
  return sendSuccess(res, 200, updated);
}

// DELETE /api/v1/contributors/:id
async function remove(req, res) {
  const items = await readAll();
  const index = items.findIndex((c) => c.id === req.params.id);
  if (index === -1) throw notFound(req.params.id);

  items.splice(index, 1);
  await writeAll(items);
  return sendNoContent(res);
}

module.exports = { list, getById, create, replace, remove };

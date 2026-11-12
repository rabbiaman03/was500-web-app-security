// Validation rules for the contributors resource (express-validator).
// These declare what a valid request looks like; the routes attach them,
// and handleValidation turns the collected failures into one 400 response.
const { body, query, param, validationResult } = require("express-validator");
const { sendError } = require("../utils/responses");

const ALLOWED_INTERESTS = [
  "Cryptanalysis",
  "Information Theory",
  "Public-Key Cryptography",
  "Applied Cryptography",
];
const ALLOWED_FIELDS = ["fullName", "email", "yearOfStudy", "interest"];
const SORTABLE_FIELDS = ["fullName", "email", "yearOfStudy", "interest", "joinedAt"];
const ALLOWED_QUERY = ["interest", "sort", "order", "page", "limit"];

// Reject any property we did not ask for (2.24). Reported as a normal validation failure.
const noUnexpectedFields = body().custom((value) => {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Request body must be a JSON object.");
  }
  const extra = Object.keys(value).filter((key) => !ALLOWED_FIELDS.includes(key));
  if (extra.length > 0) {
    throw new Error(`Unexpected field(s): ${extra.join(", ")}. Allowed: ${ALLOWED_FIELDS.join(", ")}.`);
  }
  return true;
});

// Same rules as Lab 06. Every chain runs, so every failing field is reported at once.
const contributorBody = [
  noUnexpectedFields,
  body("fullName")
    .exists({ values: "falsy" }).withMessage("fullName is required.").bail()
    .isString().withMessage("fullName must be a string.").bail()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage("fullName must be 2-100 characters after trimming.")
    .escape(), // store &lt; instead of < so the value is safe if it is ever rendered as HTML
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
];

const idParam = [param("id").isUUID(4).withMessage("id must be a valid UUID.")];

// Query rules for the list endpoint: bad values are a 400, never a crash or a silent default.
const listQuery = [
  query().custom((value) => {
    const extra = Object.keys(value || {}).filter((key) => !ALLOWED_QUERY.includes(key));
    if (extra.length > 0) throw new Error(`Unknown query parameter(s): ${extra.join(", ")}.`);
    return true;
  }),
  query("interest").optional()
    .isIn(ALLOWED_INTERESTS).withMessage(`interest must be one of: ${ALLOWED_INTERESTS.join(", ")}.`),
  query("sort").optional()
    .isIn(SORTABLE_FIELDS).withMessage(`sort must be one of: ${SORTABLE_FIELDS.join(", ")}.`),
  query("order").optional()
    .isIn(["asc", "desc"]).withMessage("order must be asc or desc."),
  query("page").optional()
    .isInt({ min: 1 }).withMessage("page must be an integer of 1 or more.").toInt(),
  query("limit").optional()
    .isInt({ min: 1, max: 100 }).withMessage("limit must be an integer from 1 to 100.").toInt(),
];

// Runs after the chains above: one 400 listing every failure, or on to the controller.
function handleValidation(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const details = result.array().map((e) => ({
    field: e.path || "(body)",
    location: e.location,
    message: e.msg,
  }));
  return sendError(res, 400, "Validation failed.", details);
}

module.exports = {
  ALLOWED_INTERESTS,
  SORTABLE_FIELDS,
  contributorBody,
  idParam,
  listQuery,
  handleValidation,
};

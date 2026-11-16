// models/legend.model.js
// The Mongoose model for one legend in the Cipher Archive (Lab 08, Part C).
// The shape matches the design from Part A (2.4): era / knownFor / field are
// embedded as plain fields because they belong to exactly one legend.

const mongoose = require("mongoose");

// The four permitted research fields (same values used since Lab 02).
const FIELDS = [
  "Cryptanalysis",
  "Information Theory",
  "Programming Languages",
  "Public-Key Cryptography",
];

const legendSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "name is required."],
      trim: true,
      unique: true, // NOTE: not a validator - Mongoose builds a unique index and MongoDB enforces it
    },
    era: {
      type: String,
      required: [true, "era is required."],
      trim: true,
    },
    knownFor: {
      type: String,
      required: [true, "knownFor is required."],
      trim: true,
      minlength: [10, "knownFor must be at least 10 characters (got {VALUE})."],
    },
    field: {
      type: String,
      required: [true, "field is required."],
      enum: {
        values: FIELDS,
        message: `"{VALUE}" is not a permitted field. Use one of: ${FIELDS.join(", ")}.`,
      },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    addedAt: {
      type: Date,
      default: Date.now, // pass the function, not Date.now(), so each document gets its own time
    },
  },
  {
    collection: "legends", // use the same collection created in the shell in Part B
    strict: "throw", // reject unknown properties instead of silently dropping them
  }
);

const Legend = mongoose.model("Legend", legendSchema);

module.exports = Legend;
module.exports.FIELDS = FIELDS;

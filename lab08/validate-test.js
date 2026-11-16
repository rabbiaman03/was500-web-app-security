// validate-test.js
// Deliberately attempts four invalid saves and reports what happens to each.
// Every attempt must be rejected and the collection must still hold exactly
// the six seeded legends afterwards.
//
// Run after seeding: npm run seed && npm run validate

require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Legend = require("./models/legend.model");

const attempts = [
  {
    id: "a",
    label: "A legend with no name",
    doc: {
      era: "1918–2013",
      knownFor: "Co-designing the RSA public-key cryptosystem",
      field: "Public-Key Cryptography",
    },
  },
  {
    id: "b",
    label: 'A legend whose field is "Astrology"',
    doc: {
      name: "Nostradamus",
      era: "1503–1566",
      knownFor: "Writing famously vague prophecies in quatrains",
      field: "Astrology",
    },
  },
  {
    id: "c",
    label: 'A legend whose knownFor is "short"',
    doc: {
      name: "Ron Rivest",
      era: "b. 1947",
      knownFor: "short",
      field: "Public-Key Cryptography",
    },
  },
  {
    id: "d",
    label: "A second legend with a name that already exists",
    doc: {
      name: "Alan Turing",
      era: "1912–1954",
      knownFor: "A duplicate entry that should never be stored",
      field: "Cryptanalysis",
    },
  },
];

function describeError(err) {
  if (err instanceof mongoose.Error.ValidationError) {
    const lines = [`${err.name} (raised by Mongoose in Node.js - nothing was sent to MongoDB)`];
    for (const [path, e] of Object.entries(err.errors)) {
      lines.push(`  - path "${path}" [kind: ${e.kind}]: ${e.message}`);
    }
    return lines;
  }
  if (err.code === 11000) {
    return [
      `${err.name} code ${err.code} (raised by the MongoDB server - the insert reached the database and was refused)`,
      `  - ${err.message}`,
      `  - keyValue: ${JSON.stringify(err.keyValue)}`,
    ];
  }
  return [`${err.name}: ${err.message}`];
}

async function run() {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
  }
  await mongoose.connect(process.env.MONGO_URI);
  await Legend.syncIndexes(); // the unique index on name must exist for attempt (d)

  const before = await Legend.countDocuments();
  console.log(`Documents before the test: ${before}\n`);

  let rejected = 0;
  for (const attempt of attempts) {
    console.log(`(${attempt.id}) ${attempt.label}`);
    try {
      const saved = await new Legend(attempt.doc).save();
      console.log(`  FAIL - the document was saved with _id ${saved._id}\n`);
    } catch (err) {
      rejected += 1;
      console.log("  REJECTED");
      for (const line of describeError(err)) console.log(`  ${line}`);
      console.log("");
    }
  }

  const after = await Legend.countDocuments();
  console.log(`Documents after the test:  ${after}`);
  console.log(`Rejected ${rejected} of ${attempts.length} invalid saves.`);
  console.log(
    rejected === attempts.length && after === before
      ? "RESULT: PASS - every invalid document was rejected and the collection is unchanged."
      : "RESULT: FAIL - at least one invalid document got through."
  );
  if (rejected !== attempts.length || after !== before) process.exitCode = 1;
}

run()
  .catch((err) => {
    console.error("validate-test crashed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

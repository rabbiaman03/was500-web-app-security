// seed.js
// Connects with MONGO_URI from .env, clears the legends collection and inserts
// the six Lab 02 legends THROUGH the Mongoose model, so every document passes
// the schema (types, required, trim, minlength, enum, defaults) on the way in.
//
// Run: npm run seed   (or: node seed.js)

require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const Legend = require("./models/legend.model");

const legends = [
  {
    name: "Alan Turing",
    era: "1912–1954",
    knownFor: "Breaking the Enigma cipher at Bletchley Park",
    field: "Cryptanalysis",
  },
  {
    name: "Claude Shannon",
    era: "1916–2001",
    knownFor: "Founding information theory",
    field: "Information Theory",
  },
  {
    name: "Grace Hopper",
    era: "1906–1992",
    knownFor: 'Compilers, and popularising the term "debugging"',
    field: "Programming Languages",
  },
  {
    name: "Elizebeth Smith Friedman",
    era: "1892–1980",
    knownFor: "Breaking smuggling and spy ciphers for the US Coast Guard",
    field: "Cryptanalysis",
  },
  {
    name: "Whitfield Diffie",
    era: "b. 1944",
    knownFor: "Co-inventing public-key exchange",
    field: "Public-Key Cryptography",
  },
  {
    name: "Martin Hellman",
    era: "b. 1945",
    knownFor: "Co-inventing public-key exchange",
    field: "Public-Key Cryptography",
  },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    throw new Error("MONGO_URI is not set. Copy .env.example to .env and fill it in.");
  }

  await mongoose.connect(uri);
  console.log(`Connected to database "${mongoose.connection.name}" on ${mongoose.connection.host}:${mongoose.connection.port}`);

  const { deletedCount } = await Legend.deleteMany({});
  console.log(`Cleared legends collection (${deletedCount} documents removed)`);

  // Make sure the unique index on "name" exists before anything else writes to the collection.
  await Legend.syncIndexes();

  // Model.create() runs full validation and applies defaults for every document.
  const created = await Legend.create(legends);
  console.log(`Inserted ${created.length} legends through the Legend model:`);
  for (const doc of created) {
    console.log(`  ${doc._id}  ${doc.name.padEnd(26)} ${doc.field.padEnd(24)} verified=${doc.verified}`);
  }

  console.log(`Documents now in collection: ${await Legend.countDocuments()}`);
}

seed()
  .catch((err) => {
    console.error("Seed failed:", err.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());

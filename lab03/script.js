// ---------- Data ----------
// const stops the name "legends" from ever pointing at a different array,
// but the array and the objects inside it can still be changed.
const legends = [
  {
    name: "Alan Turing",
    era: "1912–1954",
    knownFor: "Breaking the Enigma cipher at Bletchley Park",
    field: "Cryptanalysis"
  },
  {
    name: "Claude Shannon",
    era: "1916–2001",
    knownFor: "Founding information theory",
    field: "Information Theory"
  },
  {
    name: "Grace Hopper",
    era: "1906–1992",
    knownFor: "Compilers, and popularising the term \"debugging\"",
    field: "Programming Languages"
  },
  {
    name: "Elizebeth Smith Friedman",
    era: "1892–1980",
    knownFor: "Breaking smuggling and spy ciphers for the US Coast Guard",
    field: "Cryptanalysis"
  },
  {
    name: "Whitfield Diffie",
    era: "b. 1944",
    knownFor: "Co-inventing public-key exchange",
    field: "Public-Key Cryptography"
  },
  {
    name: "Martin Hellman",
    era: "b. 1945",
    knownFor: "Co-inventing public-key exchange",
    field: "Public-Key Cryptography"
  }
];

// ---------- Page elements ----------
const gallery = document.getElementById("gallery");
const toggleBtn = document.getElementById("toggleBtn");
const legendSearch = document.getElementById("legendSearch");
const searchBtn = document.getElementById("searchBtn");
const searchResult = document.getElementById("searchResult");
const summaryBtn = document.getElementById("summaryBtn");
const summaryResult = document.getElementById("summaryResult");

// ---------- Show / hide the gallery ----------
let galleryVisible = true;

toggleBtn.onclick = () => {
  galleryVisible = !galleryVisible;

  if (galleryVisible) {
    // Setting "" removes the inline style, so styles.css applies display: grid again.
    // Setting "block" here would break the grid and stack the cards in one column.
    gallery.style.display = "";
    toggleBtn.textContent = "Hide Legends";
  } else {
    gallery.style.display = "none";
    toggleBtn.textContent = "Show Legends";
  }
};

// ---------- Search ----------
// Takes the typed name and returns a message; it never touches the page itself.
function getLegendMessage(searchName) {
  const cleanedName = searchName.trim().toLowerCase();

  if (cleanedName === "") {
    return "Please enter a name.";
  }

  for (const legend of legends) {
    const storedName = legend.name.toLowerCase();
    // Accept the full name ("alan turing") or any single part of it ("turing").
    const nameParts = storedName.split(" ");

    if (storedName === cleanedName || nameParts.includes(cleanedName)) {
      return `${legend.name} (${legend.era}) — ${legend.knownFor}`;
    }
  }

  return "No legend by that name in this collection.";
}

searchBtn.onclick = () => {
  searchResult.textContent = getLegendMessage(legendSearch.value);
};

// Pressing Enter in the search box runs the same search.
legendSearch.onkeydown = (keyEvent) => {
  if (keyEvent.key === "Enter") {
    searchResult.textContent = getLegendMessage(legendSearch.value);
  }
};

// ---------- Field summary ----------
// Turns a field name into a short category label shown next to its count.
const getFieldCategory = (fieldName) => {
  switch (fieldName) {
    case "Cryptanalysis":
      return "code breaking";
    case "Information Theory":
    case "Public-Key Cryptography":
      return "code making";
    case "Programming Languages":
      return "software foundations";
    default:
      return "uncategorised";
  }
};

function countLegendsByField(legendList) {
  const fieldCounts = {};

  for (const legend of legendList) {
    if (fieldCounts[legend.field] === undefined) {
      fieldCounts[legend.field] = 0;
    }
    fieldCounts[legend.field] += 1;
  }

  return fieldCounts;
}

const buildSummary = () => {
  const fieldCounts = countLegendsByField(legends);
  const summaryParts = [];

  for (const fieldName of Object.keys(fieldCounts)) {
    summaryParts.push(`${fieldName}: ${fieldCounts[fieldName]} (${getFieldCategory(fieldName)})`);
  }

  return `${summaryParts.join(", ")}.`;
};

summaryBtn.onclick = () => {
  summaryResult.textContent = buildSummary();
};

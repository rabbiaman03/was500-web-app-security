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

// ================= Lab 04: Research Assignments =================

// ---------- Data ----------
// Both the list and the dropdown are built from this one array.
// Adding a sixth object here adds it to both controls with no other change.
const assignments = [
  { id: "enigma", title: "Trace the Enigma rotor wiring", topic: "Mechanical ciphers" },
  { id: "vigenere", title: "Break a Vigenère cipher by hand", topic: "Classical cryptanalysis" },
  { id: "entropy", title: "Measure the entropy of a password set", topic: "Information theory" },
  { id: "rsa", title: "Explain RSA key generation", topic: "Public-key cryptography" },
  { id: "hashing", title: "Compare three password hashing functions", topic: "Applied cryptography" }
];

// ---------- Page elements ----------
const assignmentList = document.getElementById("assignmentList");
const assignmentSelect = document.getElementById("assignmentSelect");
const researchLog = document.getElementById("researchLog");
const startBtn = document.getElementById("startBtn");

// ---------- Current state ----------
let selectedLegend = null;     // the selected card element
let selectedAssignment = null; // the selected object from the assignments array

// ---------- Build the list and the dropdown in one pass ----------
// Placeholder option so "nothing chosen yet" is a real state of the dropdown.
const placeholderOption = document.createElement("option");
placeholderOption.value = "";
placeholderOption.textContent = "-- Choose an assignment --";
assignmentSelect.appendChild(placeholderOption);

for (const assignment of assignments) {
  // List item: title, with the topic on a second line
  const item = document.createElement("li");
  item.setAttribute("data-id", assignment.id);
  item.setAttribute("tabindex", "0");

  const titleText = document.createElement("span");
  titleText.textContent = assignment.title;

  const topicText = document.createElement("span");
  topicText.className = "assignment-topic";
  topicText.textContent = assignment.topic;

  item.appendChild(titleText);
  item.appendChild(topicText);
  assignmentList.appendChild(item);

  // Dropdown option for the same assignment
  const option = document.createElement("option");
  option.value = assignment.id;
  option.textContent = assignment.title;
  assignmentSelect.appendChild(option);
}

// ---------- Research log ----------
// Describes the current state. Used both when something is selected and
// when Start Research is pressed without everything chosen.
function getStatusMessage() {
  if (selectedLegend === null) {
    return "Select a legend by clicking a card.";
  }
  if (selectedAssignment === null) {
    return "Select a research assignment.";
  }
  const legendName = selectedLegend.querySelector("h2").textContent;
  return `Ready: ${legendName} will work on "${selectedAssignment.title}" (${selectedAssignment.topic}). Press Start Research.`;
}

const updateLog = () => {
  researchLog.textContent = getStatusMessage();
};

startBtn.addEventListener("click", () => {
  if (selectedLegend === null || selectedAssignment === null) {
    updateLog();
    return;
  }
  const legendName = selectedLegend.querySelector("h2").textContent;
  researchLog.textContent = `${legendName} has started researching "${selectedAssignment.title}", a study in ${selectedAssignment.topic.toLowerCase()}.`;
});

// ---------- Assignment selection (list <-> dropdown) ----------
// Highlights one list item, syncs the dropdown, and updates the log.
// Passing "" clears the selection.
function selectAssignment(assignmentId) {
  for (const item of assignmentList.querySelectorAll("li")) {
    item.classList.remove("selected");
    item.removeAttribute("aria-current");
  }

  selectedAssignment = assignments.find((assignment) => assignment.id === assignmentId) || null;

  if (selectedAssignment !== null) {
    const item = assignmentList.querySelector(`li[data-id="${assignmentId}"]`);
    item.classList.add("selected");
    item.setAttribute("aria-current", "true");
  }

  assignmentSelect.value = assignmentId;
  updateLog();
}

// One delegated listener on the <ul> handles every item, including ones added later.
assignmentList.addEventListener("click", (event) => {
  // closest() finds the <li> even if a <span> inside it was clicked,
  // and returns null if the list's padding was clicked.
  const item = event.target.closest("li");
  if (item === null) {
    return;
  }
  selectAssignment(item.getAttribute("data-id"));
});

assignmentList.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.tagName === "LI") {
    event.preventDefault();
    selectAssignment(event.target.getAttribute("data-id"));
  }
});

assignmentSelect.addEventListener("change", (event) => {
  selectAssignment(event.target.value);
});

// ---------- Legend selection (cards) ----------
function selectLegend(card) {
  for (const otherCard of gallery.querySelectorAll(".card")) {
    otherCard.classList.remove("selected");
    otherCard.removeAttribute("aria-current");
  }
  card.classList.add("selected");
  card.setAttribute("aria-current", "true");
  selectedLegend = card;
  updateLog();
}

// Also delegated: one listener on the gallery for all six cards.
gallery.addEventListener("click", (event) => {
  const card = event.target.closest(".card");
  if (card !== null) {
    selectLegend(card);
  }
});

gallery.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && event.target.classList.contains("card")) {
    event.preventDefault();
    selectLegend(event.target);
  }
});

// Show the starting state as soon as the page loads.
updateLog();

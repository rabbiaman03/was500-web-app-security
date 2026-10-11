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

// ==========================================================================
// Lab 05: Contributor Registration form validation
// ==========================================================================

/**
 * Cipher Legends Archive - Client-Side Validation Script (Week 5 Lab Practice)
 * 
 * Implements:
 * - Separate, pure validation functions with no DOM access (Step 5.13)
 * - Single display function to show/clear errors and manage aria-invalid (Step 5.14)
 * - Real-time validation on input, specific actionable messages (Step 5.15a-d, 5.16)
 * - Live password requirements checklist with separate progress (Step 5.15e)
 * - Cross-field confirm-password re-check on either field modification (Step 5.15f)
 * - Accessible form submission with preventDefault, all-at-once error display,
 *   keyboard focus movement, and aria-live announcements (Step 5.17-5.18, 6.19-6.21)
 */

/* ==========================================================================
   Part 1: Pure Validation Functions (No DOM Access, Returns String Verdict)
   ========================================================================== */

/**
 * Validates full name: required, at least 2 characters.
 * @param {string} value
 * @returns {string} Error message or empty string if valid.
 */
function validateFullName(value) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return 'Full name is required.';
  }
  if (value.trim().length < 2) {
    return 'Full name must be at least 2 characters long.';
  }
  return '';
}

/**
 * Validates email: required, valid email format.
 * @param {string} value
 * @returns {string} Error message or empty string if valid.
 */
function validateEmail(value) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return 'Email address is required.';
  }
  // Standard RFC-compliant HTML5 email pattern
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (!emailPattern.test(value.trim())) {
    return 'Please enter a valid email address (e.g. contributor@cipherlegends.org).';
  }
  return '';
}

/**
 * Validates password: required, >= 10 chars, uppercase, lowercase, number, symbol.
 * @param {string} value
 * @returns {string} Error message or empty string if valid.
 */
function validatePassword(value) {
  if (!value || typeof value !== 'string' || value === '') {
    return 'Password is required.';
  }
  if (value.length < 10) {
    return 'Password must be at least 10 characters long.';
  }
  if (!/[A-Z]/.test(value)) {
    return 'Password needs at least one uppercase letter (A–Z).';
  }
  if (!/[a-z]/.test(value)) {
    return 'Password needs at least one lowercase letter (a–z).';
  }
  if (!/[0-9]/.test(value)) {
    return 'Password needs at least one number (0–9).';
  }
  if (!/[^A-Za-z0-9\s]/.test(value)) {
    return 'Password needs at least one symbol (e.g. !@#$%^&*).';
  }
  return '';
}

/**
 * Validates confirm password: required, must match password.
 * @param {string} confirmValue
 * @param {string} passwordValue
 * @returns {string} Error message or empty string if valid.
 */
function validateConfirmPassword(confirmValue, passwordValue) {
  if (!confirmValue || typeof confirmValue !== 'string' || confirmValue === '') {
    return 'Please confirm your password.';
  }
  if (confirmValue !== passwordValue) {
    return 'Passwords do not match.';
  }
  return '';
}

/**
 * Validates year of study: required, integer between 1 and 6.
 * @param {string|number} value
 * @returns {string} Error message or empty string if valid.
 */
function validateYearOfStudy(value) {
  if (value === '' || value === null || value === undefined) {
    return 'Year of study is required.';
  }
  const num = Number(value);
  if (!Number.isInteger(num) || num < 1 || num > 6) {
    return 'Year of study must be a whole number between 1 and 6.';
  }
  return '';
}

/**
 * Validates area of interest: required dropdown selection from allowed options.
 * @param {string} value
 * @returns {string} Error message or empty string if valid.
 */
function validateInterest(value) {
  const allowed = [
    'Cryptanalysis',
    'Information Theory',
    'Public-Key Cryptography',
    'Applied Cryptography'
  ];
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return 'Please select an area of interest.';
  }
  if (!allowed.includes(value.trim())) {
    return 'Please select a valid area of interest from the list.';
  }
  return '';
}

/**
 * Validates motivation statement: required textarea, at least 30 characters.
 * @param {string} value
 * @returns {string} Error message or empty string if valid.
 */
function validateMotivation(value) {
  if (!value || typeof value !== 'string' || value.trim() === '') {
    return 'Why you are joining is required.';
  }
  const trimmedLen = value.trim().length;
  if (trimmedLen < 30) {
    return `Motivation statement must be at least 30 characters (currently ${trimmedLen}).`;
  }
  return '';
}

/* ==========================================================================
   Part 2: Single Error Display Function (Step 5.14 & Accessibility Step 6.21)
   ========================================================================== */

/**
 * Displays or clears error state and messages for a specific field element.
 * Updates text, visibility, classes, and aria-invalid attribute.
 * @param {HTMLElement} fieldElement
 * @param {string} errorMessage
 */
function displayFieldError(fieldElement, errorMessage) {
  if (!fieldElement) return;

  // Extract the associated error container ID from aria-describedby or field convention
  const describedBy = fieldElement.getAttribute('aria-describedby') || '';
  const errorId = describedBy.split(' ').find(id => id.endsWith('Error')) || `${fieldElement.id}Error`;
  const errorElement = document.getElementById(errorId);

  if (errorMessage) {
    // Show error message and mark field as invalid
    if (errorElement) {
      errorElement.textContent = errorMessage;
      errorElement.style.display = 'block';
    }
    fieldElement.setAttribute('aria-invalid', 'true');
    fieldElement.classList.add('is-invalid');
    fieldElement.classList.remove('is-valid');
  } else {
    // Clear error message and mark field as valid
    if (errorElement) {
      errorElement.textContent = '';
      errorElement.style.display = 'none';
    }
    fieldElement.removeAttribute('aria-invalid');
    fieldElement.classList.remove('is-invalid');
    fieldElement.classList.add('is-valid');
  }
}

/* ==========================================================================
   Part 3: UI Helper Functions (Password Progress & Char Counter)
   ========================================================================== */

/**
 * Updates the visual live progress checklist for password requirements.
 * @param {string} value
 */
function updatePasswordCriteriaUI(value) {
  if (typeof document === 'undefined') return;

  const reqs = [
    { id: 'reqLength', valid: value.length >= 10 },
    { id: 'reqUpper', valid: /[A-Z]/.test(value) },
    { id: 'reqLower', valid: /[a-z]/.test(value) },
    { id: 'reqNumber', valid: /[0-9]/.test(value) },
    { id: 'reqSymbol', valid: /[^A-Za-z0-9\s]/.test(value) }
  ];

  reqs.forEach(({ id, valid }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const marker = el.querySelector('.status-marker');

    if (valid) {
      el.className = 'criteria-item valid';
      if (marker) marker.textContent = '✓';
    } else {
      el.className = 'criteria-item invalid';
      if (marker) marker.textContent = '✕';
    }
  });
}

/**
 * Resets the password progress checklist to its initial unchecked state.
 */
function resetPasswordCriteriaUI() {
  if (typeof document === 'undefined') return;

  const ids = ['reqLength', 'reqUpper', 'reqLower', 'reqNumber', 'reqSymbol'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.className = 'criteria-item invalid';
    const marker = el.querySelector('.status-marker');
    if (marker) marker.textContent = '✕';
  });
}

/* ==========================================================================
   Part 4: Event Listeners & Interactive Wiring (DOM Ready)
   ========================================================================== */

if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('joinForm');
    if (!form) return;

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const yearOfStudyInput = document.getElementById('yearOfStudy');
    const interestSelect = document.getElementById('interest');
    const motivationTextarea = document.getElementById('motivation');
    const motivationCounter = document.getElementById('motivationCounter');
    const formStatus = document.getElementById('formStatus');

    // Track whether form submission has been attempted
    let hasSubmitted = false;

    // 1. Full Name - validate on input
    fullNameInput.addEventListener('input', () => {
      const error = validateFullName(fullNameInput.value);
      displayFieldError(fullNameInput, error);
    });

    // 2. Email - validate on input
    emailInput.addEventListener('input', () => {
      const error = validateEmail(emailInput.value);
      displayFieldError(emailInput, error);
    });

    // 3. Password - validate on input, update checklist, re-check confirm password (Step 5.15e, f)
    passwordInput.addEventListener('input', () => {
      const val = passwordInput.value;
      updatePasswordCriteriaUI(val);

      const error = validatePassword(val);
      displayFieldError(passwordInput, error);

      // Confirm-password re-checks when password field changes
      if (confirmPasswordInput.value.length > 0 || hasSubmitted) {
        const confirmError = validateConfirmPassword(confirmPasswordInput.value, val);
        displayFieldError(confirmPasswordInput, confirmError);
      }
    });

    // 4. Confirm Password - validate on input (Step 5.15f)
    confirmPasswordInput.addEventListener('input', () => {
      const error = validateConfirmPassword(confirmPasswordInput.value, passwordInput.value);
      displayFieldError(confirmPasswordInput, error);
    });

    // 5. Year of Study - validate on input & change
    const handleYearValidation = () => {
      const error = validateYearOfStudy(yearOfStudyInput.value);
      displayFieldError(yearOfStudyInput, error);
    };
    yearOfStudyInput.addEventListener('input', handleYearValidation);
    yearOfStudyInput.addEventListener('change', handleYearValidation);

    // 6. Area of Interest - validate on change & input
    const handleInterestValidation = () => {
      const error = validateInterest(interestSelect.value);
      displayFieldError(interestSelect, error);
    };
    interestSelect.addEventListener('change', handleInterestValidation);
    interestSelect.addEventListener('input', handleInterestValidation);

    // 7. Motivation - validate on input and update character counter
    motivationTextarea.addEventListener('input', () => {
      const val = motivationTextarea.value.trim();
      const len = val.length;

      if (motivationCounter) {
        motivationCounter.textContent = `${len} / 30 characters`;
        if (len >= 30) {
          motivationCounter.classList.add('valid');
        } else {
          motivationCounter.classList.remove('valid');
        }
      }

      const error = validateMotivation(motivationTextarea.value);
      displayFieldError(motivationTextarea, error);
    });

    /* ==========================================================================
       Part 5: Form Submission Handling (Step 5.17, 5.18, 6.19)
       ========================================================================== */
    form.addEventListener('submit', (event) => {
      // Block default browser submission unconditionally (no backend until Lab 06)
      event.preventDefault();
      hasSubmitted = true;

      // Run custom validation on all seven fields
      const fieldsToValidate = [
        {
          element: fullNameInput,
          error: validateFullName(fullNameInput.value)
        },
        {
          element: emailInput,
          error: validateEmail(emailInput.value)
        },
        {
          element: passwordInput,
          error: validatePassword(passwordInput.value)
        },
        {
          element: confirmPasswordInput,
          error: validateConfirmPassword(confirmPasswordInput.value, passwordInput.value)
        },
        {
          element: yearOfStudyInput,
          error: validateYearOfStudy(yearOfStudyInput.value)
        },
        {
          element: interestSelect,
          error: validateInterest(interestSelect.value)
        },
        {
          element: motivationTextarea,
          error: validateMotivation(motivationTextarea.value)
        }
      ];

      let firstInvalidElement = null;

      // Display all errors at once (Step 5.17)
      fieldsToValidate.forEach(({ element, error }) => {
        displayFieldError(element, error);
        if (error && !firstInvalidElement) {
          firstInvalidElement = element;
        }
      });

      if (firstInvalidElement) {
        // Announce failure state via aria-live status container
        if (formStatus) {
          formStatus.textContent = 'Please correct the highlighted errors before submitting your application.';
          formStatus.className = 'form-status status-error';
          formStatus.style.display = 'flex';
        }
        // Move keyboard focus to the first invalid field
        firstInvalidElement.focus();
      } else {
        // All fields valid: announce success and reset form (Step 5.18)
        if (formStatus) {
          formStatus.textContent = 'Application submitted successfully! Welcome to the Cipher Legends Contributor Archive.';
          formStatus.className = 'form-status status-success';
          formStatus.style.display = 'flex';
        }

        form.reset();
        hasSubmitted = false;

        // Clear all is-valid and is-invalid classes and aria-invalid attributes
        const allFormControls = form.querySelectorAll('input, select, textarea');
        allFormControls.forEach(ctrl => {
          ctrl.classList.remove('is-valid', 'is-invalid');
          ctrl.removeAttribute('aria-invalid');
        });

        // Reset password requirements tracker and character counter
        resetPasswordCriteriaUI();
        if (motivationCounter) {
          motivationCounter.textContent = '0 / 30 characters';
          motivationCounter.classList.remove('valid');
        }
      }
    });
  });
}

// Export functions for unit testing in Node environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validateFullName,
    validateEmail,
    validatePassword,
    validateConfirmPassword,
    validateYearOfStudy,
    validateInterest,
    validateMotivation
  };
}

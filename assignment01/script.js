"use strict";

/* ---------- Data: single source for the gallery, the filter and the form ---------- */

const machines = [
  {
    id: "scytale",
    name: "Scytale",
    period: "c. 7th century BC",
    era: "Antiquity",
    principle: "Transposition by winding a strip around a rod",
    usedBy: "Ancient Sparta",
    summary: "Message was hidden behind a strip of leather tied around a stick, which rearranged its letters.",
    description: "The sender tied a leather strip to a wooden stick and wrote on it. When it is unraveled, the letters would appear to be shuffled, and the person who needs to read the message must use the stick of the same diameter. The example clearly reflects the main principle of transposition – letters remain unchanged, only their order is rearranged."
  },
  {
    id: "alberti-disk",
    name: "Alberti Cipher Disk",
    period: "1467",
    era: "15th to 18th century",
    principle: "First polyalphabetic substitution device",
    usedBy: "Renaissance Italy",
    summary: "Two rotating alphabets provide means for encoding one letter in multiple ways.",
    description: "Alberti used two disks with different alphabets inscribed on them. He instructed the authors to rotate the inner disk periodically so that one letter would encode in a different way. This technique prevented the analysis of letters frequency which was used to break codes for many years already."
  },
  {
    id: "jefferson-disk",
    name: "Jefferson Disk",
    period: "c. 1795",
    era: "15th to 18th century",
    principle: "36 lettered disks producing a polyalphabetic cipher",
    usedBy: "United States",
    summary: "Thirty-six alphabets scrambled on one axle, used to turn them into a message.",
    description: "Every single one of the 36 wooden circles had a scrambled alphabet written on it. Both the sender and receiver used a certain sequence to stack them on an axle. After that, the sender would turn the disks to reveal the message on one line, after which he would write another line in ciphertext. This system was lost for more than a century."
  },
  {
    id: "enigma",
    name: "Enigma",
    period: "1920s to 1945",
    era: "20th century",
    principle: "Rotor-based polyalphabetic substitution",
    usedBy: "German military",
    summary: "Stepping rotors made sure that the substitution alphabet kept changing with each keystroke.",
    description: "A keystroke passed an electrical current through the plugboard, a series of rotors, and the reflector, while the rotors stepped up so that each subsequent letter got substituted by a new letter. An enormous number of combinations persuaded the Germans that the messages were secure. Polish and then British code breakers took advantage of human factors to decipher them and influence the course of the war at sea."
  },
  {
    id: "lorenz-sz42",
    name: "Lorenz SZ42",
    period: "1940s",
    era: "20th century",
    principle: "Stream cipher for teleprinter traffic",
    usedBy: "German High Command",
    summary: "A key stream was created by twelve pinned wheels which was then merged with the teleprinter text.",
    description: "The SZ42 machine existed in the path connecting the teleprinter and the radio link and mixed every letter with a key letter created by twelve pinned wheels. This process was the same for encoding and decoding; hence, all the receiver required were the matching wheel settings. The messages were used to connect the German High Command to its field armies."
  },
  {
    id: "colossus",
    name: "Colossus",
    period: "1943",
    era: "20th century",
    principle: "Programmable electronic machine built to break Lorenz",
    usedBy: "Bletchley Park",
    summary: "Thousands of valves tried out Lorenz wheel positions more quickly than any human ever could.",
    description: "Created by Tommy Flowers, Colossus analyzed the captured Lorenz code written on a paper tape loop and measured its correspondence to wheel position hypotheses, at a rate of thousands of characters per second. Its switches and plugs allowed it to be programmed for various tests, making it one of the earliest examples of a programmable electronic computer. It remained classified until the 1970s, therefore its role in computing history was only recognised decades later."
  }
];

/* ---------- Shared helpers ---------- */

function getUniqueEras(list) {
  return [...new Set(list.map((machine) => machine.era))];
}

function createElementWithText(tag, text, className) {
  const element = document.createElement(tag);
  element.textContent = text;
  if (className) {
    element.className = className;
  }
  return element;
}

function createOption(value, label) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = label;
  return option;
}

/* ---------- machines.html: gallery, toggle and filter ---------- */

function createFactList(machine) {
  const list = document.createElement("dl");
  list.className = "facts";
  const facts = [
    ["Period", machine.period],
    ["Principle", machine.principle],
    ["Used by", machine.usedBy]
  ];
  facts.forEach(([term, detail]) => {
    list.append(createElementWithText("dt", term), createElementWithText("dd", detail));
  });
  return list;
}

function createToggleButton(machine, descriptionId) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "card-toggle";
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", descriptionId);
  button.append(
    createElementWithText("span", "Read more", "toggle-label"),
    createElementWithText("span", ` about ${machine.name}`, "visually-hidden")
  );
  return button;
}

function createMachineCard(machine) {
  const descriptionId = `desc-${machine.id}`;
  const card = document.createElement("article");
  card.className = "machine-card";
  card.id = `machine-${machine.id}`;
  card.dataset.era = machine.era;

  const description = createElementWithText("p", machine.description, "description");
  description.id = descriptionId;
  description.hidden = true;

  card.append(
    createElementWithText("h2", machine.name),
    createFactList(machine),
    createElementWithText("p", machine.summary, "summary"),
    createToggleButton(machine, descriptionId),
    description
  );
  return card;
}

function setCardExpanded(card, expanded) {
  const button = card.querySelector(".card-toggle");
  const description = card.querySelector(".description");
  button.setAttribute("aria-expanded", String(expanded));
  button.querySelector(".toggle-label").textContent = expanded ? "Show less" : "Read more";
  description.hidden = !expanded;
  card.classList.toggle("is-expanded", expanded);
}

function toggleCard(card) {
  const button = card.querySelector(".card-toggle");
  const isExpanded = button.getAttribute("aria-expanded") === "true";
  setCardExpanded(card, !isExpanded);
}

function handleCardClick(event) {
  // Clicks on links or a text selection should not toggle the card.
  if (event.target.closest("a") || window.getSelection().toString() !== "") {
    return;
  }
  toggleCard(event.currentTarget);
}

function renderGallery(gallery, list) {
  gallery.replaceChildren();
  list.forEach((machine) => {
    const card = createMachineCard(machine);
    card.addEventListener("click", handleCardClick);
    gallery.append(card);
  });
}

function describeCount(shown, total) {
  const noun = total === 1 ? "machine" : "machines";
  return `Showing ${shown} of ${total} ${noun}.`;
}

function applyFilter(gallery, era) {
  const cards = gallery.querySelectorAll(".machine-card");
  let shown = 0;
  cards.forEach((card) => {
    const matches = era === "all" || card.dataset.era === era;
    card.hidden = !matches;
    if (matches) {
      shown += 1;
    }
  });
  return describeCount(shown, cards.length);
}

function openCardFromHash(gallery) {
  const card = location.hash ? gallery.querySelector(location.hash) : null;
  if (card) {
    setCardExpanded(card, true);
    card.scrollIntoView();
  }
}

function initGallery() {
  const gallery = document.querySelector("#gallery");
  const filter = document.querySelector("#era-filter");
  const status = document.querySelector("#filter-status");
  if (!gallery || !filter || !status) {
    return;
  }

  renderGallery(gallery, machines);
  getUniqueEras(machines).forEach((era) => filter.append(createOption(era, era)));
  status.textContent = applyFilter(gallery, filter.value);

  filter.addEventListener("change", () => {
    status.textContent = applyFilter(gallery, filter.value);
  });

  openCardFromHash(gallery);
}

/* ---------- join.html: validation ---------- */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
const MIN_REASON_LENGTH = 40;

function getNameError(field) {
  const value = field.value.trim();
  if (value === "") {
    return "Enter your full name.";
  }
  if (value.length < 2) {
    return "Your name must be at least 2 characters long.";
  }
  return "";
}

function getEmailError(field) {
  const value = field.value.trim();
  if (value === "") {
    return "Enter your email address.";
  }
  if (field.validity.typeMismatch || !EMAIL_PATTERN.test(value)) {
    return "Enter an email like name@example.com, including a domain ending such as .com or .ca.";
  }
  return "";
}

function getSelectError(field, noun) {
  return field.value === "" ? `Choose a ${noun} from the list.` : "";
}

function getYearsError(field) {
  if (field.validity.badInput) {
    return "Years of interest must be a number, for example 5.";
  }
  if (field.value === "") {
    return "Enter how many years you have been interested, from 0 to 80.";
  }
  const years = Number(field.value);
  if (!Number.isInteger(years)) {
    return "Use a whole number of years, without decimals.";
  }
  if (years < 0 || years > 80) {
    return `${years} is out of range. Enter a number from 0 to 80.`;
  }
  return "";
}

function getReasonError(field) {
  const length = field.value.trim().length;
  if (length === 0) {
    return "Tell us why you are joining, in at least 40 characters.";
  }
  if (length < MIN_REASON_LENGTH) {
    const remaining = MIN_REASON_LENGTH - length;
    return `Add ${remaining} more character${remaining === 1 ? "" : "s"} (40 minimum, spaces at the ends don't count).`;
  }
  return "";
}

const fieldRules = {
  "full-name": getNameError,
  email: getEmailError,
  "member-type": (field) => getSelectError(field, "member type"),
  "favourite-machine": (field) => getSelectError(field, "favourite machine"),
  years: getYearsError,
  reason: getReasonError
};

function getCounterText(length) {
  if (length >= MIN_REASON_LENGTH) {
    return `${length} characters. Minimum reached.`;
  }
  return `${length} of ${MIN_REASON_LENGTH} characters minimum, ${MIN_REASON_LENGTH - length} to go.`;
}

function showFieldState(field, message) {
  const group = field.closest(".field");
  const errorElement = document.querySelector(`#${field.id}-error`);
  const isValid = message === "";
  errorElement.textContent = isValid ? "" : `Error: ${message}`;
  field.setAttribute("aria-invalid", String(!isValid));
  group.classList.toggle("is-invalid", !isValid);
  group.classList.toggle("is-valid", isValid);
}

function validateField(field) {
  const message = fieldRules[field.id](field);
  showFieldState(field, message);
  return message === "";
}

function clearFieldStates(form) {
  form.querySelectorAll(".field").forEach((group) => {
    group.classList.remove("is-valid", "is-invalid");
  });
  form.querySelectorAll(".error").forEach((element) => {
    element.textContent = "";
  });
  form.querySelectorAll("[aria-invalid]").forEach((field) => {
    field.removeAttribute("aria-invalid");
  });
}

function getInvalidFields(form) {
  const fields = Object.keys(fieldRules).map((id) => form.querySelector(`#${id}`));
  return fields.filter((field) => !validateField(field));
}

function buildConfirmation(form) {
  const name = form.elements.fullName.value.trim();
  const type = form.elements.memberType.value;
  const machine = form.elements.favouriteMachine.value;
  const article = /^[AEIOU]/.test(type) ? "an" : "a";
  return `Thank you, ${name}! Your application as ${article} ${type} has been received. We'll be in touch about events featuring the ${machine}.`;
}

function handleSubmit(event, form, confirmation, status, counter) {
  event.preventDefault();
  const invalidFields = getInvalidFields(form);

  if (invalidFields.length > 0) {
    const count = invalidFields.length;
    status.textContent = `The form was not sent. ${count} field${count === 1 ? " needs" : "s need"} attention.`;
    confirmation.hidden = true;
    invalidFields[0].focus();
    return;
  }

  confirmation.textContent = buildConfirmation(form);
  confirmation.hidden = false;
  status.textContent = "";
  form.reset();
  clearFieldStates(form);
  counter.textContent = getCounterText(0);
  confirmation.focus();
}

function initForm() {
  const form = document.querySelector("#join-form");
  if (!form) {
    return;
  }
  const confirmation = document.querySelector("#confirmation");
  const status = document.querySelector("#form-status");
  const counter = document.querySelector("#reason-counter");
  const machineSelect = form.querySelector("#favourite-machine");

  machines.forEach((machine) => machineSelect.append(createOption(machine.name, machine.name)));

  Object.keys(fieldRules).forEach((id) => {
    const field = form.querySelector(`#${id}`);
    field.addEventListener("input", () => validateField(field));
  });

  form.querySelector("#reason").addEventListener("input", (event) => {
    counter.textContent = getCounterText(event.target.value.trim().length);
  });

  form.addEventListener("submit", (event) => {
    handleSubmit(event, form, confirmation, status, counter);
  });
}

/* ---------- Start ---------- */

initGallery();
initForm();

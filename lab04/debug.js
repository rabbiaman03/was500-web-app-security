// Step 8 - corrected version of the broken highlight script.
const list = document.getElementById("assignmentList");

list.addEventListener("click", function (event) {
  // Fix 4: work from the <li>, not whatever element was clicked.
  // Clicking the list's padding makes event.target the <ul> itself.
  const clickedItem = event.target.closest("li");
  if (clickedItem === null) {
    return;
  }

  const items = document.querySelectorAll("#assignmentList li");
  for (let i = 0; i < items.length; i++) {
    items[i].classList.remove("selected");
  }
  clickedItem.classList.add("selected");                     // Fix 1: "selected", not "Selected"
  console.log("Selected: " + clickedItem.textContent);       // Fix 3: textContent, not innerHTML
  event.stopPropagation();                                   // Fix 2: () actually calls the method
});

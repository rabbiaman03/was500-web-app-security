/**
 * debug.js - Corrected Password Validation Logic (Part C)
 * 
 * This file addresses all five defects identified in the original snippet:
 * 1. Missing 'return': Added 'return' before "Password needs a number".
 * 2. Inverted condition: Changed 'value.match(/[!@#$%^&*]/)' to '!value.match(/[!@#$%^&*]/)'.
 * 3. Inconsistent return type: Changed 'return true;' to 'return "";' so valid returns falsy (empty string).
 * 4. Error never cleared: Added an else branch (or direct assignment) to clear textContent when valid.
 * 5. Stated rule not checked: Added an explicit check for the 'Required' rule (empty/whitespace input).
 */

function validatePassword(value) {
  // Defect 5 Fix: Check that the required field is not empty
  if (!value || value.trim() === "") {
    return "Password is required";
  }

  // Length check (at least 10 characters)
  if (value.length < 10) {
    return "Password must be at least 10 characters";
  }

  // Upper and lower case check
  if (!value.match(/[A-Z]/) || !value.match(/[a-z]/)) {
    return "Password needs upper and lower case";
  }

  // Defect 1 Fix: Added missing 'return' statement
  if (!value.match(/[0-9]/)) {
    return "Password needs a number";
  }

  // Defect 2 Fix: Inverted condition to check when a symbol is MISSING
  if (!value.match(/[!@#$%^&*]/)) {
    return "Password needs a symbol";
  }

  // Defect 3 Fix: Return empty string "" instead of boolean true for consistent type
  return "";
}

// Attach event listener in browser environment with Defect 4 Fix
if (typeof document !== "undefined") {
  const pw = document.getElementById("password");
  const pwError = document.getElementById("pwError");

  if (pw && pwError) {
    pw.addEventListener("input", () => {
      const error = validatePassword(pw.value);
      // Defect 4 Fix: Clear error message when valid, show message when invalid
      if (error) {
        pwError.textContent = error;
      } else {
        pwError.textContent = "";
      }
    });
  }
}

// Export for testing / Node.js environments
if (typeof module !== "undefined" && module.exports) {
  module.exports = { validatePassword };
}

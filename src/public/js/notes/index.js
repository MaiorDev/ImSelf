// Main file that imports modules

// Import functions from modules
import { initAddNote, initDeleteNote } from "./notes.js";

// Main initialization function
function initNotes() {
  // Initialize subject functionality
  initAddNote();
  initDeleteNote();
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initNotes);

// For compatibility with older browsers or scripts that don't support modules
window.initSchool = initNotes;

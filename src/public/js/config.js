// Simple toggle functionality for demonstration
// document.querySelectorAll(".toggle-input").forEach((toggle) => {
//   toggle.addEventListener("change", function () {
//     const toggleText = this.parentElement.querySelector(".toggle-text");
//     if (this.id === "theme-toggle") {
//       toggleText.textContent = this.checked ? "Dark" : "Light";
//     } else if (this.id === "time-format-toggle") {
//       toggleText.textContent = this.checked ? "24-hour" : "12-hour";
//     }
//   });
// });

// Color option selection
// document.querySelectorAll(".color-option").forEach((option) => {
//   option.addEventListener("click", function () {
//     document
//       .querySelectorAll(".color-option")
//       .forEach((opt) => opt.classList.remove("active"));
//     this.classList.add("active");
//   });
// });

// Close session functionality
document
  .getElementById("close-session")
  .addEventListener("click", async function () {
    try {
      // Show loading state on button
      this.textContent = "Closing session...";
      this.disabled = true;

      // Make a request to the logout endpoint
      const response = await fetch("/config/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin", // Include cookies in the request
      });

      if (response.ok) {
        // Redirect to login page on successful logout
        window.location.href = "/";
      } else {
        // Handle error
        console.error("Logout failed");
        this.textContent = "Close Session";
        this.disabled = false;
        alert("Failed to log out. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      this.textContent = "Close Session";
      this.disabled = false;
      alert("An error occurred. Please try again.");
    }
  });

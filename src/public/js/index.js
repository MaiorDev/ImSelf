// Get login form elements
const loginForm = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const loginButton = document.getElementById("login-btn");
// Add event listener to form fields
// Add event listener to login form
loginForm.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent form submission
  // Get form values
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  // Reset previous error messages
  clearErrors();

  // Validate form fields
  let isValid = true;

  if (email.trim() === "") {
    showError(emailInput, "Email cannot be blank");
    isValid = false;
  } else if (!isValidEmail(email)) {
    showError(emailInput, "Please enter a valid email address");
    isValid = false;
  }

  if (password.trim() === "") {
    showError(passwordInput, "Password cannot be blank");
    isValid = false;
  }

  // If form is valid, submit it
  if (isValid) {
    // Here you would typically send the data to the server
    loginButton.textContent = "Logging in...";
    loginButton.disabled = true;

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })
      .then((response) => {
        if (!response.ok) {
          return response.json().then((data) => {
            throw new Error(data.error || "Login failed");
          });
        }
        return response.json();
      })
      .then((data) => {
        console.log(data.userEmail);
        window.location.href = `/menu/${data.userEmail}`;
      })
      .catch((error) => {
        console.error("sadasd");
        // Show error message
        showError(emailInput, error.message);
        // Reset button state
        loginButton.textContent = "Login";
        loginButton.disabled = false;
      });
  }
});

// Function to display error message
function showError(input, message) {
  const formGroup = input.parentElement;
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.textContent = message;

  // Add error class to form group
  formGroup.classList.add("error");

  // Add error message after the input
  formGroup.appendChild(errorElement);
}

// Function to clear all error messages
function clearErrors() {
  // Remove all error messages
  const errorMessages = document.querySelectorAll(".error-message");
  errorMessages.forEach((element) => element.remove());

  // Remove error class from form groups
  const formGroups = document.querySelectorAll(".form-group");
  formGroups.forEach((group) => group.classList.remove("error"));
}

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

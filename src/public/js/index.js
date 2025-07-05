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

document.addEventListener('DOMContentLoaded', function() {
    const togglePasswordButton = document.querySelector('.toggle-password');
    const passwordInput = document.querySelector('#password');

    if (togglePasswordButton && passwordInput) {
        togglePasswordButton.addEventListener('click', function() {
            // Cambiar el tipo de input entre password y text
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);

            // Cambiar el ícono del ojo
            const eyeIcon = this.querySelector('svg path');
            if (type === 'password') {
                // Ícono de ojo cerrado
                eyeIcon.setAttribute('d', 'M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z');
            } else {
                // Ícono de ojo abierto
                eyeIcon.setAttribute('d', 'M3.98 8.223A10.907 10.907 0 001 12c0 .778.108 1.533.311 2.25.17.61.43 1.177.762 1.69.793 1.219 1.903 2.215 3.208 2.84A9.9 9.9 0 0012 20c1.894 0 3.63-.48 5.18-1.42 1.304-.626 2.415-1.622 3.208-2.84.332-.513.592-1.08.762-1.69.203-.717.311-1.472.311-2.25 0-.778-.108-1.533-.311-2.25-.17-.61-.43-1.177-.762-1.69-.793-1.219-1.903-2.215-3.208-2.84A9.9 9.9 0 0012 4c-1.894 0-3.63.48-5.18 1.42-1.304.626-2.415 1.622-3.208 2.84-.332.513-.592 1.08-.762 1.69zM12 18a6 6 0 110-12 6 6 0 010 12zm0-2a4 4 0 100-8 4 4 0 000 8z');
            }

            // Actualizar el texto del aria-label
            this.setAttribute('aria-label', 
                type === 'password' ? 'Mostrar contraseña' : 'Ocultar contraseña'
            );
        });
    }
});

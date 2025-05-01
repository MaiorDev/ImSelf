const formRegister = document.getElementById("register-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("confirm-password");

// Set maximum character limits
const MAX_USERNAME_LENGTH = 20;
const MAX_EMAIL_LENGTH = 50;
const MAX_PASSWORD_LENGTH = 30;

// Add input event listeners to limit input length
username.addEventListener("input", () => {
  if (username.value.length > MAX_USERNAME_LENGTH) {
    username.value = username.value.slice(0, MAX_USERNAME_LENGTH);
  }
});

email.addEventListener("input", () => {
  if (email.value.length > MAX_EMAIL_LENGTH) {
    email.value = email.value.slice(0, MAX_EMAIL_LENGTH);
  }
});

password.addEventListener("input", () => {
  if (password.value.length > MAX_PASSWORD_LENGTH) {
    password.value = password.value.slice(0, MAX_PASSWORD_LENGTH);
  }
});

password2.addEventListener("input", () => {
  if (password2.value.length > MAX_PASSWORD_LENGTH) {
    password2.value = password2.value.slice(0, MAX_PASSWORD_LENGTH);
  }
});

formRegister.addEventListener("submit", (e) => {
  e.preventDefault();

  if (validateInputs()) {
    submitForm();
  }
});

function validateInputs() {
  const usernameValue = username.value.trim();
  const emailValue = email.value.trim();
  const passwordValue = password.value.trim();
  const password2Value = password2.value.trim();

  let isValid = true;

  if (usernameValue === "") {
    setErrorFor(username, "Username cannot be blank");
    isValid = false;
  } else if (usernameValue.length < 8) {
    setErrorFor(username, "Username must be at least 8 characters");
    isValid = false;
  } else {
    setSuccessFor(username);
  }

  if (emailValue === "") {
    setErrorFor(email, "Email cannot be blank");
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setErrorFor(email, "Provide a valid email address");
    isValid = false;
  } else {
    setSuccessFor(email);
  }

  if (passwordValue === "") {
    setErrorFor(password, "Password cannot be blank");
    isValid = false;
  } else if (passwordValue.length < 8) {
    setErrorFor(password, "Password must be at least 8 characters");
    isValid = false;
  } else {
    setSuccessFor(password);
  }

  if (password2Value === "") {
    setErrorFor(password2, "Please confirm password");
    isValid = false;
  } else if (password2Value !== passwordValue) {
    setErrorFor(password2, "Password does not match");
    isValid = false;
  } else {
    setSuccessFor(password2);
  }

  return isValid;
}

// Función para enviar el formulario mediante fetch
function submitForm() {
  const registerBtn = document.querySelector(".register-btn");
  const originalBtnText = registerBtn.textContent;

  // Cambiar el texto del botón para mostrar que está procesando
  registerBtn.textContent = "Creating account...";
  registerBtn.disabled = true;

  // Obtener los datos del formulario

  const formData = {
    username: username.value.trim(),
    email: email.value.trim(),
    password: password.value.trim(),
  };

  // Send form data to the server using fetch
  fetch("/register/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  })
    .then((response) => {
      // Verificar si la respuesta es JSON antes de intentar parsearla
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return response.json().then((data) => {
          if (!response.ok) {
            throw new Error(data.message || "Network response was not ok");
          }
          return data;
        });
      } else {
        // Si no es JSON, podría ser una redirección o un error
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        // Si es una respuesta exitosa pero no es JSON, simplemente redirigir
        window.location.href = "/verifyAccount";
        return { success: true };
      }
    })
    .then((data) => {
      console.log(data);
      localStorage.setItem("token", data.token);
      window.location.href = "/verifyAccount";
    })
    .catch((error) => {
      alert(error.message || "An error occurred. Please try again.");
      registerBtn.textContent = originalBtnText;
      registerBtn.disabled = false;
    });
}
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
function setErrorFor(input, message) {
  const formControl = input.parentElement;
  // Check if small element exists, if not create it
  let small = formControl.querySelector("small");
  if (!small) {
    small = document.createElement("small");
    small.className = "error-message";
    formControl.appendChild(small);
  }

  // Usar classList en lugar de className para preservar otras clases
  formControl.classList.remove("success");
  formControl.classList.add("error");

  small.innerText = message;
}

function setSuccessFor(input) {
  const formControl = input.parentElement;

  // Usar classList en lugar de className para preservar otras clases
  formControl.classList.remove("error");
  formControl.classList.add("success");

  // Remove error message if it exists
  const small = formControl.querySelector("small");
  if (small) {
    small.innerText = "";
  }
}

// Add this code to handle password strength
const strengthMeter = document.getElementById("strength-meter-fill");
const strengthText = document.getElementById("password-strength-text");

// Add event listener to password input
password.addEventListener("input", updatePasswordStrength);

function updatePasswordStrength() {
  const passwordValue = password.value;
  const strength = calculatePasswordStrength(passwordValue);

  // Update the strength meter width and color
  strengthMeter.style.width = strength.percent + "%";
  strengthMeter.style.backgroundColor = strength.color;

  // Update the strength text
  strengthText.textContent = strength.text;
  strengthText.style.color = strength.color;
}

function calculatePasswordStrength(password) {
  // Empty password
  if (!password) {
    return {
      percent: 0,
      color: "#ff5757",
      text: "Password strength",
    };
  }

  let score = 0;

  // Basic length check
  if (password.length >= 8) score += 20;
  if (password.length >= 12) score += 10;

  // Complexity checks
  if (/[a-z]/.test(password)) score += 10; // lowercase
  if (/[A-Z]/.test(password)) score += 15; // uppercase
  if (/[0-9]/.test(password)) score += 15; // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 20; // special characters

  // Variety check
  const variety =
    (password.match(/[a-z]/) || []).length +
    (password.match(/[A-Z]/) || []).length +
    (password.match(/[0-9]/) || []).length +
    (password.match(/[^a-zA-Z0-9]/) || []).length;

  if (variety >= 3) score += 10;

  // Determine strength level
  let strengthLevel = {
    percent: score,
    text: "Weak",
    color: "#ff5757", // red
  };

  if (score >= 40) {
    strengthLevel.text = "Medium";
    strengthLevel.color = "#ffbd3e"; // orange
  }

  if (score >= 70) {
    strengthLevel.text = "Strong";
    strengthLevel.color = "#08a88a"; // green
  }

  if (score >= 90) {
    strengthLevel.text = "Very Strong";
    strengthLevel.color = "#08a88a"; // green
  }

  return strengthLevel;
}

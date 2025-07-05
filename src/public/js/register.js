const formRegister = document.getElementById("register-form");
const username = document.getElementById("username");
const email = document.getElementById("email");
const password = document.getElementById("password");
const password2 = document.getElementById("confirm-password");
const togglePasswordButtons = document.querySelectorAll(".toggle-password");

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

// Toggle password visibility
togglePasswordButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const input = button.parentElement.querySelector("input");
    const type =
      input.getAttribute("type") === "password" ? "text" : "password";
    input.setAttribute("type", type);

    // Update button aria-label
    const ariaLabel =
      type === "password" ? "Mostrar contraseña" : "Ocultar contraseña";
    button.setAttribute("aria-label", ariaLabel);

    // Update icon (optional - if you want to change the icon)
    const eyeIcon = button.querySelector(".eye-icon");
    if (type === "password") {
      eyeIcon.innerHTML = `
        <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
        <path fill-rule="evenodd" d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z" clip-rule="evenodd" />
      `;
    } else {
      eyeIcon.innerHTML = `
        <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      `;
    }
  });
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
    setErrorFor(username, "El nombre de usuario no puede estar vacío");
    isValid = false;
  } else if (usernameValue.length < 8) {
    setErrorFor(
      username,
      "El nombre de usuario debe tener al menos 8 caracteres"
    );
    isValid = false;
  } else {
    setSuccessFor(username);
  }

  if (emailValue === "") {
    setErrorFor(email, "El correo electrónico no puede estar vacío");
    isValid = false;
  } else if (!isValidEmail(emailValue)) {
    setErrorFor(email, "Proporciona un correo electrónico válido");
    isValid = false;
  } else {
    setSuccessFor(email);
  }

  if (passwordValue === "") {
    setErrorFor(password, "La contraseña no puede estar vacía");
    isValid = false;
  } else if (passwordValue.length < 8) {
    setErrorFor(password, "La contraseña debe tener al menos 8 caracteres");
    isValid = false;
  } else {
    setSuccessFor(password);
  }

  if (password2Value === "") {
    setErrorFor(password2, "Por favor confirma tu contraseña");
    isValid = false;
  } else if (password2Value !== passwordValue) {
    setErrorFor(password2, "Las contraseñas no coinciden");
    isValid = false;
  } else {
    setSuccessFor(password2);
  }

  return isValid;
}

// Función para enviar el formulario mediante fetch
function submitForm() {
  const registerBtn = document.querySelector(".register-btn");
  const originalBtnText = registerBtn.innerHTML;

  // Cambiar el texto del botón para mostrar que está procesando
  registerBtn.innerHTML = `<span>Creando cuenta...</span>`;
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
      alert(
        error.message || "Ha ocurrido un error. Por favor intenta de nuevo."
      );
      registerBtn.innerHTML = originalBtnText;
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
      color: "#ef4444",
      text: "Seguridad de la contraseña",
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
    text: "Débil",
    color: "#ef4444", // red
  };

  if (score >= 40) {
    strengthLevel.text = "Media";
    strengthLevel.color = "#f59e0b"; // amber
  }

  if (score >= 70) {
    strengthLevel.text = "Fuerte";
    strengthLevel.color = "#10b981"; // green
  }

  if (score >= 90) {
    strengthLevel.text = "Muy fuerte";
    strengthLevel.color = "#10b981"; // green
  }

  return strengthLevel;
}

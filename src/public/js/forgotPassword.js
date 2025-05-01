document
  .getElementById("forgot-password-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const submitBtn = this.querySelector(".submit-btn");
    const btnText = submitBtn.querySelector(".btn-text");
    const email = document.getElementById("email").value;

    // Show loading state
    btnText.textContent = "Sending...";
    submitBtn.disabled = true;

    try {
      const response = await fetch("/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        // Show success message
        document.querySelector(".forgot-password-card").innerHTML = `
                <div class="success-message">
                    <i class="fas fa-check-circle"></i>
                    <h2>Email Sent!</h2>
                    <p>We've sent a password reset link to <strong>${email}</strong>. Please check your inbox and follow the instructions.</p>
                    <a href="/" class="back-link">Back to Login</a>
                </div>
            `;
      } else {
        const data = await response.json();
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error) {
      // Show error message
      const errorMsg = document.createElement("div");
      errorMsg.className = "error-message";
      errorMsg.textContent =
        error.message || "Failed to send reset link. Please try again.";

      const existingError = document.querySelector(".error-message");
      if (existingError) {
        existingError.remove();
      }

      document.querySelector(".form-group").after(errorMsg);

      // Reset button
      btnText.textContent = "Send Reset Link";
      submitBtn.disabled = false;
    }
  });

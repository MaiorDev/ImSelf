document.addEventListener('DOMContentLoaded', function() {
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');
    const resetForm = document.getElementById('reset-password-form');
    const submitButton = document.querySelector('.submit-btn');
    const strengthMeter = document.querySelector('.strength-meter-fill');
    const strengthText = document.querySelector('.strength-text span');
    const passwordMatchMessage = document.querySelector('.password-match-message');
    const requirements = {
        length: { regex: /.{8,}/, element: document.querySelector('[data-requirement="length"]') },
        uppercase: { regex: /[A-Z]/, element: document.querySelector('[data-requirement="uppercase"]') },
        lowercase: { regex: /[a-z]/, element: document.querySelector('[data-requirement="lowercase"]') },
        number: { regex: /[0-9]/, element: document.querySelector('[data-requirement="number"]') },
        special: { regex: /[^A-Za-z0-9]/, element: document.querySelector('[data-requirement="special"]') }
    };
    
    // Toggle password visibility
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const targetInput = document.getElementById(targetId);
            const icon = this.querySelector('i');
            
            if (targetInput.type === 'password') {
                targetInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                targetInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Check password strength
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        let requirementsMet = 0;
        
        // Check each requirement
        for (const key in requirements) {
            const requirement = requirements[key];
            const isValid = requirement.regex.test(password);
            
            if (isValid) {
                requirement.element.querySelector('i').classList.remove('fa-times-circle');
                requirement.element.querySelector('i').classList.add('fa-check-circle');
                requirementsMet++;
            } else {
                requirement.element.querySelector('i').classList.remove('fa-check-circle');
                requirement.element.querySelector('i').classList.add('fa-times-circle');
            }
        }
        
        // Calculate strength based on requirements met
        strength = requirementsMet;
        
        // Update strength meter
        strengthMeter.setAttribute('data-strength', strength);
        
        // Update strength text
        if (strength === 0) strengthText.textContent = 'Very Weak';
        else if (strength === 1) strengthText.textContent = 'Weak';
        else if (strength === 2) strengthText.textContent = 'Fair';
        else if (strength === 3) strengthText.textContent = 'Good';
        else if (strength === 4) strengthText.textContent = 'Strong';
        else if (strength === 5) strengthText.textContent = 'Very Strong';
        
        // Check if passwords match
        checkPasswordsMatch();
        
        // Enable/disable submit button
        updateSubmitButton();
    });
    
    // Check if passwords match
    confirmPasswordInput.addEventListener('input', checkPasswordsMatch);
    
    function checkPasswordsMatch() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        
        if (confirmPassword === '') {
            passwordMatchMessage.textContent = '';
            passwordMatchMessage.classList.remove('error', 'success');
        } else if (password === confirmPassword) {
            passwordMatchMessage.textContent = 'Passwords match';
            passwordMatchMessage.classList.remove('error');
            passwordMatchMessage.classList.add('success');
        } else {
            passwordMatchMessage.textContent = 'Passwords do not match';
            passwordMatchMessage.classList.remove('success');
            passwordMatchMessage.classList.add('error');
        }
        
        updateSubmitButton();
    }
    
    function updateSubmitButton() {
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;
        let allRequirementsMet = true;
        
        // Check if all requirements are met
        for (const key in requirements) {
            if (!requirements[key].regex.test(password)) {
                allRequirementsMet = false;
                break;
            }
        }
        
        // Enable button only if all requirements are met and passwords match
        submitButton.disabled = !(allRequirementsMet && password === confirmPassword && confirmPassword !== '');
    }
    
    // Handle form submission
    resetForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const token = document.getElementById('token').value;
        const password = passwordInput.value;
        const btnText = submitButton.querySelector('.btn-text');
        
        // Show loading state
        btnText.textContent = 'Resetting...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token, password })
            });
            
            if (response.ok) {
                // Show success message
                document.querySelector('.reset-password-card').innerHTML = `
                    <div class="success-message">
                        <i class="fas fa-check-circle"></i>
                        <h2>Password Reset Successful!</h2>
                        <p>Your password has been successfully reset. You can now log in with your new password.</p>
                        <a href="/" class="back-link">Go to Login</a>
                    </div>
                `;
            } else {
                const data = await response.json();
                throw new Error(data.message || 'Failed to reset password');
            }
        } catch (error) {
            // Show error message
            const errorMsg = document.createElement('div');
            errorMsg.className = 'error-message';
            errorMsg.textContent = error.message || 'An error occurred. Please try again.';
            
            const existingError = document.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            
            resetForm.prepend(errorMsg);
            
            // Reset button
            btnText.textContent = 'Reset Password';
            submitButton.disabled = false;
        }
    });
});
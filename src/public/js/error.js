document.addEventListener('DOMContentLoaded', () => {
    // Simplify button click behavior
    const backButton = document.querySelector('.back-button');
    
    if (backButton) {
        backButton.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Add a class instead of directly manipulating style
            backButton.classList.add('clicked');
            
            setTimeout(() => {
                window.location.href = '/';
            }, 300);
        });
    }
    
    // Detectar si hay un código de error específico
    const errorCode = document.querySelector('.error-code');
    if (errorCode && errorCode.textContent.trim() !== '') {
        console.log(`Error detectado: ${errorCode.textContent}`);
    }
    
    // Simplify icon click behavior
    const errorIcon = document.querySelector('.error-icon');
    if (errorIcon) {
        errorIcon.addEventListener('click', () => {
            // Toggle a class instead of manipulating animation directly
            errorIcon.classList.add('clicked');
            setTimeout(() => {
                errorIcon.classList.remove('clicked');
            }, 10);
        });
    }
});
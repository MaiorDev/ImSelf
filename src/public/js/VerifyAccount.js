document.getElementById('resend-link').addEventListener('click', async function(e) {
    e.preventDefault();
    this.textContent = 'Sending...';
    
    try {
        const response = await fetch('/auth/resend-verification', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            this.textContent = 'Email sent!';
            setTimeout(() => {
                this.textContent = 'click here to resend';
            }, 3000);
        } else {
            this.textContent = 'Failed to send';
            setTimeout(() => {
                this.textContent = 'click here to resend';
            }, 3000);
        }
    } catch (error) {
        this.textContent = 'Error occurred';
        setTimeout(() => {
            this.textContent = 'click here to resend';
        }, 3000);
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Animación de entrada para las tarjetas
    const cards = document.querySelectorAll('.Card');
    
    cards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            card.style.transition = 'all 0.5s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });

    // Efecto hover suave para las imágenes
    cards.forEach(card => {
        const img = card.querySelector('img');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const angleX = (y - centerY) / 20;
            const angleY = (centerX - x) / 20;
            
            img.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) scale(1.1)`;
        });
        
        card.addEventListener('mouseleave', () => {
            img.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });
});
document.addEventListener('DOMContentLoaded', () => {
  const subjects = document.querySelectorAll('.subject-card');
  
  // Animación de entrada para las materias
  subjects.forEach((subject, index) => {
    subject.style.opacity = '0';
    subject.style.transform = 'translateX(-20px)';
    setTimeout(() => {
      subject.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
      subject.style.opacity = '1';
      subject.style.transform = 'translateX(0)';
    }, index * 100);
  });

  // Efecto de hover con información adicional
  subjects.forEach(subject => {
    const info = subject.querySelector('.subject-info');
    
    subject.addEventListener('mouseenter', () => {
      subject.style.transform = 'translateY(-8px)';
      if (info) {
        info.style.opacity = '1';
        info.style.transform = 'translateY(0)';
      }
    });

    subject.addEventListener('mouseleave', () => {
      subject.style.transform = 'translateY(0)';
      if (info) {
        info.style.opacity = '0';
        info.style.transform = 'translateY(10px)';
      }
    });
  });
});
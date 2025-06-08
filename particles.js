// Create ocean particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 30;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        
        // Random positioning
        const posX = Math.random() * 100; // random position from 0-100% of viewport width
        const delay = Math.random() * 15; // random delay between 0-15s
        const duration = 10 + Math.random() * 10; // random duration between 10-20s
        const size = 1 + Math.random() * 3; // random size between 1-4px
        
        particle.style.left = `${posX}%`;
        particle.style.bottom = `${Math.random() * 20}%`; // Start from bottom 0-20%
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        
        particlesContainer.appendChild(particle);
    }
}
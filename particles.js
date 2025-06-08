// Create ocean particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 50; // Increased particle count for more visual richness
    
    // Clear existing particles
    particlesContainer.innerHTML = '';
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        
        // Random positioning
        const posX = Math.random() * 100; // random position from 0-100% of viewport width
        const delay = Math.random() * 15; // random delay between 0-15s
        const duration = 10 + Math.random() * 10; // random duration between 10-20s
        const size = 1 + Math.random() * 3; // random size between 1-4px
        const opacity = 0.3 + Math.random() * 0.7; // random opacity between 0.3-1
        
        particle.style.left = `${posX}%`;
        particle.style.bottom = `${Math.random() * 20}%`; // Start from bottom 0-20%
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = opacity;
        
        // Randomly make some particles glow
        if (Math.random() > 0.8) {
            particle.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity})`;
        }
        
        particlesContainer.appendChild(particle);
    }
}

// Refresh particles periodically to keep the scene dynamic
setInterval(() => {
    if (gameState.isSailing) {
        // Only add new particles while sailing
        addNewParticles(5);
    }
}, 10000);

// Add new particles to the scene
function addNewParticles(count) {
    const particlesContainer = document.getElementById('particles');
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('span');
        particle.className = 'particle';
        
        // Random positioning
        const posX = Math.random() * 100;
        const duration = 10 + Math.random() * 10;
        const size = 1 + Math.random() * 3;
        const opacity = 0.3 + Math.random() * 0.7;
        
        particle.style.left = `${posX}%`;
        particle.style.bottom = `0%`; // Start from bottom
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = '0s'; // No delay for new particles
        particle.style.animationDuration = `${duration}s`;
        particle.style.opacity = opacity;
        
        // Randomly make some particles glow
        if (Math.random() > 0.8) {
            particle.style.boxShadow = `0 0 ${size * 2}px rgba(255, 255, 255, ${opacity})`;
        }
        
        particlesContainer.appendChild(particle);
        
        // Remove particle after animation completes
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, duration * 1000);
    }
}
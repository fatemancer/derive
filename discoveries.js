// Use discovery types from config
const discoveryTypes = GAME_CONFIG.discoveries.types;

// Schedule the next discovery to appear
function scheduleNextDiscovery() {
    // Random time between min and max interval from config
    const minInterval = GAME_CONFIG.discoveries.minInterval;
    const maxInterval = GAME_CONFIG.discoveries.maxInterval;
    const nextDiscoveryTime = minInterval + Math.random() * (maxInterval - minInterval);
    
    gameState.discoveryInterval = setTimeout(() => {
        spawnDiscovery();
        scheduleNextDiscovery(); // Schedule the next one
    }, nextDiscoveryTime);
}

// Spawn a new discovery
function spawnDiscovery() {
    const discoveryId = gameState.nextDiscoveryId++;
    const discoveryType = discoveryTypes[Math.floor(Math.random() * discoveryTypes.length)];
    
    // Random position along the horizon (10-90% of width)
    const positionX = 10 + Math.random() * 80;
    
    // Create the discovery object
    const discovery = {
        id: discoveryId,
        type: discoveryType,
        position: positionX,
        timeRemaining: GAME_CONFIG.discoveries.duration / 1000 // Convert ms to seconds for display
    };
    
    // Add to game state
    gameState.discoveries.push(discovery);
    
    // Create and add the visual element
    createDiscoveryElement(discovery);
    
    // Set timeout to remove if not investigated using duration from config
    setTimeout(() => {
        removeDiscovery(discoveryId, false);
    }, GAME_CONFIG.discoveries.duration);
}

// Create the visual element for a discovery
function createDiscoveryElement(discovery) {
    // Create container for discovery and button
    const container = document.createElement('div');
    container.className = 'discovery-container';
    container.id = `discovery-${discovery.id}`;
    container.style.cssText = `
        position: absolute;
        left: ${discovery.position}%;
        bottom: 20%;
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: fadeInFromHorizon 3s ease-out;
        z-index: 10;
    `;
    
    // Create the discovery dot
    const dot = document.createElement('div');
    dot.className = 'discovery-dot';
    dot.style.cssText = `
        background-color: ${discovery.type.color};
        box-shadow: 0 0 10px ${discovery.type.color}, 0 0 20px white;
    `;
    
    // Play a subtle sound effect for discoveries
    playDiscoverySound();
    
    // Create the investigate button
    const button = document.createElement('button');
    button.className = 'investigate-btn';
    button.textContent = 'Investigate';
    button.style.cssText = `
        background-color: #0891b2;
        padding: 8px 16px;
        font-size: 14px;
        opacity: 0;
        animation: fadeIn 1s ease-out 2s forwards;
    `;
    
    // Add click handler to the button
    button.addEventListener('click', () => {
        investigateDiscovery(discovery.id);
    });
    
    // Add elements to container
    container.appendChild(dot);
    container.appendChild(button);
    
    // Add to the DOM
    discoveriesContainer.appendChild(container);
}

// Handle investigation of a discovery
function investigateDiscovery(discoveryId) {
    // Find the discovery
    const discoveryIndex = gameState.discoveries.findIndex(d => d.id === discoveryId);
    if (discoveryIndex === -1) return;
    
    const discovery = gameState.discoveries[discoveryIndex];
    
    // Apply the distance bonus
    gameState.distance += discovery.type.bonus;
    
    // Show the message
    statusMessage.textContent = discovery.type.message + ` (+${discovery.type.bonus} nautical miles)`;
    
    // Show notification
    showNotification(discovery.type.message + ` (+${discovery.type.bonus} nautical miles)`, 'info');
    
    // Add to event history
    addEvent(`Investigated ${discovery.type.name} (+${discovery.type.bonus} nautical miles)`);
    
    // Remove the discovery
    removeDiscovery(discoveryId, true);
    
    // Update UI
    updateUI();
    
    // Save game state
    saveGameState();
}

// Remove a discovery from the game
function removeDiscovery(discoveryId, wasInvestigated) {
    // Remove from game state
    const discoveryIndex = gameState.discoveries.findIndex(d => d.id === discoveryId);
    if (discoveryIndex !== -1) {
        gameState.discoveries.splice(discoveryIndex, 1);
    }
    
    // Get the DOM element
    const element = document.getElementById(`discovery-${discoveryId}`);
    if (element) {
        if (wasInvestigated) {
            // Fade out quickly if investigated
            element.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                element.remove();
            }, 500);
        } else {
            // Fade out slowly if ignored
            element.style.animation = 'fadeOut 2s ease-out forwards';
            setTimeout(() => {
                element.remove();
            }, 2000);
        }
    }
}

// Play a subtle sound effect for discoveries
function playDiscoverySound() {
    try {
        // Create audio context
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // Create oscillator
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Configure sound
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.5); // A4
        
        // Configure volume
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.1); // Fade in
        gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5); // Fade out
        
        // Connect nodes
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        // Play sound
        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
        console.error("Error playing discovery sound:", error);
    }
}
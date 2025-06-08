// Discovery types with colors and messages
const discoveryTypes = [
    { name: "driftwood", color: "#8B4513", message: "You found driftwood! It can be used for repairs.", bonus: 2 },
    { name: "bottle", color: "#2E8B57", message: "You found a message in a bottle with ancient wisdom!", bonus: 3 },
    { name: "treasure", color: "#FFD700", message: "You found a small treasure chest with gold coins!", bonus: 5 },
    { name: "coral", color: "#FF6B6B", message: "You discovered a beautiful piece of coral!", bonus: 2 },
    { name: "seashell", color: "#E6E6FA", message: "You found a rare seashell!", bonus: 1 },
    { name: "starfish", color: "#FF7F50", message: "You discovered a vibrant starfish!", bonus: 2 }
];

// Schedule the next discovery to appear
function scheduleNextDiscovery() {
    // Random time between 15-30 seconds
    const nextDiscoveryTime = 15000 + Math.random() * 15000;
    
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
        timeRemaining: 10 // 10 seconds before it disappears
    };
    
    // Add to game state
    gameState.discoveries.push(discovery);
    
    // Create and add the visual element
    createDiscoveryElement(discovery);
    
    // Set timeout to remove if not investigated
    setTimeout(() => {
        removeDiscovery(discoveryId, false);
    }, 10000);
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
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background-color: ${discovery.type.color};
        box-shadow: 0 0 10px ${discovery.type.color}, 0 0 20px white;
        margin-bottom: 10px;
    `;
    
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
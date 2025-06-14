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
    
    // Weighted random selection based on rarity
    // First, determine if this will be a resource discovery (50% chance)
    const isResourceDiscovery = Math.random() < 0.5;
    
    let discoveryType;
    
    if (isResourceDiscovery) {
        // Select a resource discovery based on rarity
        // Higher rarity = less likely to appear
        const resourceDiscoveries = discoveryTypes.filter(d => d.resource !== null);
        
        // Calculate total weight (inverse of rarity)
        const totalWeight = resourceDiscoveries.reduce((sum, d) => {
            const resource = resourceTypes.find(r => r.id === d.resource);
            return sum + (resource ? (6 - resource.rarity) : 1); // 6 minus rarity so lower rarity has higher weight
        }, 0);
        
        // Random number between 0 and totalWeight
        let random = Math.random() * totalWeight;
        
        // Find the discovery that corresponds to this random value
        for (const d of resourceDiscoveries) {
            const resource = resourceTypes.find(r => r.id === d.resource);
            const weight = resource ? (6 - resource.rarity) : 1;
            
            random -= weight;
            if (random <= 0) {
                discoveryType = d;
                break;
            }
        }
        
        // Fallback in case something went wrong
        if (!discoveryType) {
            discoveryType = resourceDiscoveries[0];
        }
    } else {
        // Select a regular discovery
        const regularDiscoveries = discoveryTypes.filter(d => d.resource === null);
        discoveryType = regularDiscoveries[Math.floor(Math.random() * regularDiscoveries.length)];
    }
    
    // Fixed position in the upper left corner
    const positionX = 10; // Fixed at 10% from the left
    
    // Create the discovery object
    const discovery = {
        id: discoveryId,
        type: discoveryType,
        position: positionX,
        timeRemaining: GAME_CONFIG.discoveries.duration / 1000, // Convert ms to seconds for display
        mapX: undefined, // Will be initialized when map is displayed
        mapY: undefined  // Will be initialized when map is displayed
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
        display: flex;
        flex-direction: column;
        align-items: center;
        animation: fadeInFromHorizon 3s ease-out;
        z-index: 10;
        background-color: rgba(15, 23, 42, 0.7);
        border-radius: 8px;
        padding: 10px;
        border: 1px solid rgba(255, 255, 255, 0.1);
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
    
    // Check if map is installed
    const hasMap = gameState.installedUpgrades.some(upgrade => {
        const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === upgrade.upgradeId);
        return upgradeConfig && upgradeConfig.effect.type === 'map';
    });
    
    // If map is installed, check if the discovery is close enough to investigate
    if (hasMap) {
        // Grid dimensions
        const gridWidth = 5;
        const gridHeight = 9;
        
        // Center coordinates
        const centerX = Math.floor(gridWidth / 2);
        const centerY = Math.floor(gridHeight / 2);
        
        // Calculate distance to center
        const distanceToCenter = Math.sqrt(
            Math.pow(discovery.mapX - centerX, 2) +
            Math.pow(discovery.mapY - centerY, 2)
        );
        
        // If the discovery is not close enough, don't allow investigation
        // Using the same threshold (0.3) as in the map display
        if (distanceToCenter >= 0.3) {
            showNotification("The discovery is too far away to investigate. Wait for it to drift closer.", "error");
            return;
        }
    }
    
    // Apply the distance bonus
    gameState.distance += discovery.type.bonus;
    
    // Check if this discovery provides a resource
    let resourceMessage = '';
    if (discovery.type.resource) {
        // Increment the resource count
        gameState.resources[discovery.type.resource]++;
        
        // Find the resource details
        const resourceDetails = resourceTypes.find(r => r.id === discovery.type.resource);
        if (resourceDetails) {
            resourceMessage = ` You collected ${resourceDetails.emoji} ${resourceDetails.name}!`;
        }
    }
    
    // Show the message
    statusMessage.textContent = discovery.type.message + ` (+${discovery.type.bonus} nautical miles)` + resourceMessage;
    
    // Show notification
    showNotification(discovery.type.message + ` (+${discovery.type.bonus} nautical miles)` + resourceMessage, 'info');
    
    // Add to event history
    if (discovery.type.resource) {
        const resourceDetails = resourceTypes.find(r => r.id === discovery.type.resource);
        addEvent(`Investigated ${discovery.type.name} (+${discovery.type.bonus} nautical miles, +1 ${resourceDetails.name})`);
    } else {
        addEvent(`Investigated ${discovery.type.name} (+${discovery.type.bonus} nautical miles)`);
    }
    
    // Remove the discovery
    removeDiscovery(discoveryId, true);
    
    // Update UI
    updateUI();
    
    // Update map if installed
    if (hasMap) {
        processMapDisplay();
    }
    
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
    
    // Remove map marker if it exists
    const marker = document.querySelector(`.discovery-marker[data-discovery-id="${discoveryId}"]`);
    if (marker) {
        if (wasInvestigated) {
            // Fade out quickly if investigated
            marker.style.animation = 'fadeOut 0.5s ease-out forwards';
            setTimeout(() => {
                marker.remove();
            }, 500);
        } else {
            // Fade out slowly if ignored
            marker.style.animation = 'fadeOut 2s ease-out forwards';
            setTimeout(() => {
                marker.remove();
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
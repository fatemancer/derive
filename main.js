// Use config values
const vesselTypes = GAME_CONFIG.vessels;
const resourceTypes = GAME_CONFIG.resources;

// Game state object to track everything
const gameState = {
    distance: 0,
    discoveries: [],
    nextDiscoveryId: 0,
    isSailing: true,
    sailingInterval: null,
    discoveryInterval: null,
    eventHistory: [], // Array to store the last 10 events
    currentVesselIndex: 0, // Start with the raft
    resources: {
        seaweed: 0,
        wood: 0,
        plank: 0,
        cloth: 0,
        copper: 0
    }
};

// DOM elements
const distanceCount = document.getElementById('distance-count');
const anchorBtn = document.getElementById('anchor-btn');
const statusMessage = document.getElementById('status-message');
const discoveriesContainer = document.getElementById('discoveries-container');
const eventsContainer = document.getElementById('events-container');
const menuBtn = document.getElementById('menu-btn');
const menu = document.getElementById('menu');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const fileInput = document.getElementById('file-input');
const helpBtn = document.getElementById('help-btn');
const tutorial = document.getElementById('tutorial');
const tutorialClose = document.getElementById('tutorial-close');
const upgradeVesselBtn = document.getElementById('upgrade-vessel-btn');

// Anchor handler - stop/resume drifting
anchorBtn.addEventListener('click', () => {
    if (gameState.isSailing) {
        // Drop anchor - pause the journey
        gameState.isSailing = false;
        clearInterval(gameState.sailingInterval);
        clearTimeout(gameState.discoveryInterval);
        anchorBtn.textContent = "Resume Journey";
        statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
    } else {
        // Resume journey
        gameState.isSailing = true;
        startDrifting(false); // Show notifications during normal gameplay
        anchorBtn.textContent = "Drop Anchor";
    }
});

// Start automatic drifting
function startDrifting(skipNotifications = false) {
    // Get current vessel drift speed
    const currentVessel = vesselTypes[gameState.currentVesselIndex];
    const driftSpeed = currentVessel.driftSpeed;
    
    // Update distance based on vessel speed at the configured interval
    gameState.sailingInterval = setInterval(() => {
        gameState.distance += driftSpeed;
        updateUI(false); // Always show notifications during normal gameplay
        
        // Save game state at configured intervals
        if (gameState.distance % GAME_CONFIG.progression.saveInterval === 0) {
            saveGameState();
        }
    }, GAME_CONFIG.progression.driftInterval);
    
    // Schedule discoveries every 15-30 seconds
    scheduleNextDiscovery();
    
    // Update status message with vessel info
    statusMessage.textContent = `Your ${currentVessel.name} (${currentVessel.emoji}) is drifting with the current. Keep an eye out for discoveries!`;
}

// Menu button event listener
menuBtn.addEventListener('click', () => {
    if (menu.classList.contains('visible')) {
        menu.classList.remove('visible');
        menu.style.display = 'none';
    } else {
        menu.style.display = 'block';
        setTimeout(() => {
            menu.classList.add('visible');
        }, 10);
    }
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && event.target !== menuBtn) {
        menu.classList.remove('visible');
        setTimeout(() => {
            menu.style.display = 'none';
        }, 300);
    }
});

// Help button event listener
helpBtn.addEventListener('click', () => {
    tutorial.classList.add('visible');
});

// Tutorial close button
tutorialClose.addEventListener('click', () => {
    tutorial.classList.remove('visible');
});

// Upgrade vessel button event listener
upgradeVesselBtn.addEventListener('click', () => {
    upgradeVessel();
});

// Save button event listener
saveBtn.addEventListener('click', () => {
    saveGameState();
    menu.classList.remove('visible');
    setTimeout(() => {
        menu.style.display = 'none';
    }, 300);
});

// Export button event listener
exportBtn.addEventListener('click', () => {
    exportSaveData();
    menu.classList.remove('visible');
    setTimeout(() => {
        menu.style.display = 'none';
    }, 300);
});

// Import button event listener
importBtn.addEventListener('click', () => {
    fileInput.click();
    menu.classList.remove('visible');
    setTimeout(() => {
        menu.style.display = 'none';
    }, 300);
});

// File input change event listener
fileInput.addEventListener('change', (event) => {
    if (event.target.files.length > 0) {
        importSaveData(event.target.files[0]);
    }
});

// Upgrade vessel to the next level
function upgradeVessel() {
    // Get current vessel
    const currentVessel = vesselTypes[gameState.currentVesselIndex];
    const nextVesselIndex = gameState.currentVesselIndex + 1;
    
    // Check if there's a next vessel available
    if (nextVesselIndex >= vesselTypes.length) {
        showNotification("You already have the best vessel available!", "info");
        return;
    }
    
    const nextVessel = vesselTypes[nextVesselIndex];
    
    // Check if player has enough distance
    if (gameState.distance < currentVessel.upgradeCost) {
        showNotification(`Not enough distance! You need ${currentVessel.upgradeCost} nautical miles to upgrade.`, "error");
        return;
    }
    
    // Deduct the cost
    gameState.distance -= currentVessel.upgradeCost;
    
    // Upgrade the vessel
    gameState.currentVesselIndex = nextVesselIndex;
    
    // Show upgrade message
    showNotification(currentVessel.upgradeMessage, "success");
    
    // Add to event history
    addEvent(`Upgraded from ${currentVessel.name} to ${nextVessel.name}`);
    
    // Add visual effect to vessel schematic
    const schematicContainer = document.getElementById('vessel-schematic');
    if (schematicContainer) {
        schematicContainer.classList.add('vessel-upgrading');
        setTimeout(() => {
            schematicContainer.classList.remove('vessel-upgrading');
        }, 1000);
    }
    
    // If currently sailing, restart with new speed
    if (gameState.isSailing) {
        clearInterval(gameState.sailingInterval);
        startDrifting(false);
    }
    
    // Update UI
    updateUI();
    updateVesselUI();
    
    // Save game state
    saveGameState();
}

// Update the vessel UI
function updateVesselUI() {
    const currentVessel = vesselTypes[gameState.currentVesselIndex];
    const vesselDisplay = document.getElementById('vessel-display');
    
    if (vesselDisplay) {
        vesselDisplay.textContent = `${currentVessel.emoji} ${currentVessel.name}`;
    }
    
    // Update vessel schematic
    updateVesselSchematic(currentVessel);
    
    // Update upgrade panel
    const upgradePanel = document.getElementById('vessel-upgrade-panel');
    
    if (upgradePanel) {
        // Check if there's a next vessel
        if (gameState.currentVesselIndex < vesselTypes.length - 1) {
            const nextVessel = vesselTypes[gameState.currentVesselIndex + 1];
            const upgradeCost = currentVessel.upgradeCost;
            const canUpgrade = gameState.distance >= upgradeCost;
            
            // Update panel content
            document.getElementById('next-vessel-name').textContent = nextVessel.name;
            document.getElementById('next-vessel-emoji').textContent = nextVessel.emoji;
            document.getElementById('upgrade-cost').textContent = upgradeCost;
            document.getElementById('upgrade-benefit').textContent = `${currentVessel.driftSpeed} → ${nextVessel.driftSpeed}`;
            
            // Update upgrade button state
            const upgradeBtn = document.getElementById('upgrade-vessel-btn');
            upgradeBtn.disabled = !canUpgrade;
            
            // Show the panel
            upgradePanel.style.display = 'block';
        } else {
            // Hide the panel if there are no more upgrades
            upgradePanel.style.display = 'none';
        }
    }
}

// Update the vessel schematic based on vessel type
function updateVesselSchematic(vessel) {
    const schematicContainer = document.getElementById('vessel-schematic');
    if (!schematicContainer) return;
    
    // Clear existing schematic
    schematicContainer.innerHTML = '';
    
    // Set the layout class based on number of squares
    schematicContainer.className = `vessel-schematic layout-${vessel.schematicSquares}`;
    
    // Create the squares
    for (let i = 0; i < vessel.schematicSquares; i++) {
        const square = document.createElement('div');
        square.className = 'vessel-square';
        square.dataset.index = i;
        
        // Add click event listener for future interactivity
        square.addEventListener('click', () => {
            // This will be implemented later
            console.log(`Clicked vessel square ${i}`);
        });
        
        schematicContainer.appendChild(square);
    }
}

// Initialize the game
function initGame() {
    // Try to load saved game state
    if (!loadGameState()) {
        // If no save found, start a new game
        startDrifting(false); // Show notifications for new game
        addEvent("Started a new journey");
        
        // Show tutorial for new players
        setTimeout(() => {
            tutorial.classList.add('visible');
        }, 1000);
    } else {
        addEvent("Loaded saved game");
    }
    
    // Initialize particles
    createParticles();
    
    // Initialize progress bar (skip notifications during initialization)
    updateProgressBar(true);
    
    // Initialize vessel UI
    updateVesselUI();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
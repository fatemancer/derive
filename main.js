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
    },
    installedUpgrades: [] // Array to store installed upgrades with their slot index
};

// DOM elements
const distanceCount = document.getElementById('distance-count');
const anchorBtn = document.getElementById('anchor-btn');
const statusMessage = document.getElementById('status-message');
const discoveriesContainer = document.getElementById('discoveries-container');
const eventsContainer = document.getElementById('events-container');
const saveBtn = document.getElementById('save-btn');
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const fileInput = document.getElementById('file-input');
const helpBtn = document.getElementById('help-btn');
const tutorial = document.getElementById('tutorial');
const tutorialClose = document.getElementById('tutorial-close');
const upgradeVesselBtn = document.getElementById('upgrade-vessel-btn');

// Anchor handler - stop/resume drifting
anchorBtn._clickHandler = function() {
    if (gameState.isSailing) {
        // Drop anchor - pause the journey
        gameState.isSailing = false;
        clearInterval(gameState.sailingInterval);
        clearTimeout(gameState.discoveryInterval);
        clearInterval(gameState.autoCollectInterval); // Clear autocollector interval
        clearInterval(gameState.mapUpdateInterval); // Clear map update interval
        anchorBtn.textContent = "Resume Journey";
        statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
    } else {
        // Resume journey
        gameState.isSailing = true;
        startDrifting(false); // Show notifications during normal gameplay
        anchorBtn.textContent = "Drop Anchor";
    }
};

// Add the event listener
anchorBtn.addEventListener('click', anchorBtn._clickHandler);

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
    showNotification("Game saved successfully!", "success");
});

// Export button event listener
exportBtn.addEventListener('click', () => {
    exportSaveData();
});

// Import button event listener
importBtn.addEventListener('click', () => {
    fileInput.click();
});

// File input change event listener
fileInput.addEventListener('change', (event) => {
    if (event.target.files.length > 0) {
        importSaveData(event.target.files[0]);
    }
});

// Check if player has enough materials for a purchase
function hasEnoughMaterials(materialCosts) {
    if (!materialCosts) return true;
    
    for (const cost of materialCosts) {
        if ((gameState.resources[cost.id] || 0) < cost.amount) {
            return false;
        }
    }
    
    return true;
}

// Deduct materials from player's inventory
function deductMaterials(materialCosts) {
    if (!materialCosts) return;
    
    for (const cost of materialCosts) {
        gameState.resources[cost.id] -= cost.amount;
    }
}

// Format material costs for display
function formatMaterialCosts(materialCosts) {
    if (!materialCosts || materialCosts.length === 0) return "";
    
    const costStrings = materialCosts.map(cost => {
        const resourceType = resourceTypes.find(r => r.id === cost.id);
        return `${cost.amount} ${resourceType.emoji}`;
    });
    
    return costStrings.join(", ");
}

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
        showNotification(`Not enough nautical miles! You need ${currentVessel.upgradeCost} nautical miles to upgrade.`, "error");
        return;
    }
    
    // Check if player has enough materials
    if (!hasEnoughMaterials(currentVessel.upgradeMaterialCosts)) {
        let errorMessage = `Not enough materials! You need: `;
        currentVessel.upgradeMaterialCosts.forEach((cost, index) => {
            const resourceType = resourceTypes.find(r => r.id === cost.id);
            errorMessage += `${cost.amount} ${resourceType.name}`;
            if (index < currentVessel.upgradeMaterialCosts.length - 1) {
                errorMessage += ", ";
            }
        });
        showNotification(errorMessage, "error");
        return;
    }
    
    // Deduct the costs
    gameState.distance -= currentVessel.upgradeCost;
    deductMaterials(currentVessel.upgradeMaterialCosts);
    
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
            const canAffordMiles = gameState.distance >= upgradeCost;
            const canAffordMaterials = hasEnoughMaterials(currentVessel.upgradeMaterialCosts);
            const canUpgrade = canAffordMiles && canAffordMaterials;
            
            // Update panel content
            document.getElementById('next-vessel-name').textContent = nextVessel.name;
            document.getElementById('next-vessel-emoji').textContent = nextVessel.emoji;
            document.getElementById('upgrade-cost').textContent = upgradeCost;
            document.getElementById('upgrade-benefit').textContent = `${currentVessel.driftSpeed} → ${nextVessel.driftSpeed}`;
            
            // Update materials display
            const materialsElement = document.getElementById('upgrade-materials');
            if (materialsElement) {
                if (currentVessel.upgradeMaterialCosts && currentVessel.upgradeMaterialCosts.length > 0) {
                    let materialsHTML = '';
                    currentVessel.upgradeMaterialCosts.forEach((cost, index) => {
                        const resourceType = resourceTypes.find(r => r.id === cost.id);
                        const playerHasEnough = (gameState.resources[cost.id] || 0) >= cost.amount;
                        materialsHTML += `<span class="${playerHasEnough ? 'can-afford' : 'cannot-afford'}">${cost.amount} ${resourceType.emoji}</span>`;
                        if (index < currentVessel.upgradeMaterialCosts.length - 1) {
                            materialsHTML += ', ';
                        }
                    });
                    materialsElement.innerHTML = materialsHTML;
                } else {
                    materialsElement.textContent = 'None';
                }
            }
            
            // Update upgrade button state
            const upgradeBtn = document.getElementById('upgrade-vessel-btn');
            upgradeBtn.disabled = !canUpgrade;
            
            // Update button title with reason if disabled
            if (!canUpgrade) {
                if (!canAffordMiles) {
                    upgradeBtn.title = "Not enough nautical miles";
                } else {
                    upgradeBtn.title = "Not enough materials";
                }
            } else {
                upgradeBtn.title = "";
            }
            
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
        
        // Add click event listener for interactivity
        square.addEventListener('click', () => {
            showUpgradeMenu(i);
        });
        
        // Check if there's an upgrade installed in this slot
        const installedUpgrade = gameState.installedUpgrades.find(upgrade => upgrade.slotIndex === i);
        console.log(`Checking slot ${i} for upgrades:`, installedUpgrade);
        if (installedUpgrade) {
            // Add the upgrade visual to the square
            const upgradeType = GAME_CONFIG.upgrades.find(u => u.id === installedUpgrade.upgradeId);
            if (upgradeType) {
                const upgradeIcon = document.createElement('div');
                upgradeIcon.className = 'upgrade-icon';
                upgradeIcon.textContent = upgradeType.emoji;
                upgradeIcon.title = upgradeType.name;
                
                // Add the same click event to the icon
                upgradeIcon.addEventListener('click', (event) => {
                    // Stop event from bubbling to prevent double triggering
                    event.stopPropagation();
                    showUpgradeMenu(i);
                });
                
                square.appendChild(upgradeIcon);
                square.classList.add('has-upgrade');
            }
        }
        
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

// Show upgrade menu when a schematic slot is clicked
function showUpgradeMenu(slotIndex) {
    console.log("showUpgradeMenu called for slot", slotIndex);
    console.log("Installed upgrades:", gameState.installedUpgrades);
    
    // Check if there's already an upgrade in this slot
    const existingUpgrade = gameState.installedUpgrades.find(upgrade => upgrade.slotIndex === slotIndex);
    console.log("Existing upgrade found:", existingUpgrade);
    
    if (existingUpgrade) {
        console.log("Showing sell menu for upgrade:", existingUpgrade);
        // Show sell menu instead of upgrade menu
        showSellMenu(slotIndex, existingUpgrade);
        return;
    }
    
    // Remove any existing upgrade menus
    const existingMenus = document.querySelectorAll('.upgrade-menu');
    existingMenus.forEach(menu => menu.remove());
    
    // Get the clicked square element
    const square = document.querySelector(`.vessel-square[data-index="${slotIndex}"]`);
    if (!square) return;
    
    // Create the upgrade menu
    const upgradeMenu = document.createElement('div');
    upgradeMenu.className = 'upgrade-menu';
    
    // Add title
    const menuTitle = document.createElement('div');
    menuTitle.className = 'upgrade-menu-title';
    menuTitle.textContent = 'Available Upgrades';
    upgradeMenu.appendChild(menuTitle);
    
    // Add upgrades list
    const upgradesList = document.createElement('div');
    upgradesList.className = 'upgrades-list';
    
    // Add each available upgrade
    GAME_CONFIG.upgrades.forEach(upgrade => {
        const upgradeItem = document.createElement('div');
        upgradeItem.className = 'upgrade-item';
        
        // Check if player has enough nautical miles
        const canAfford = gameState.distance >= upgrade.cost;
        
        // Check if player has enough materials
        const hasEnoughMats = hasEnoughMaterials(upgrade.materialCosts);
        
        // Format material costs for display
        let materialCostsHtml = '';
        if (upgrade.materialCosts && upgrade.materialCosts.length > 0) {
            materialCostsHtml = '<div class="material-costs">';
            upgrade.materialCosts.forEach(cost => {
                const resourceType = resourceTypes.find(r => r.id === cost.id);
                const playerHasEnough = (gameState.resources[cost.id] || 0) >= cost.amount;
                materialCostsHtml += `<span class="material-cost ${playerHasEnough ? 'can-afford' : 'cannot-afford'}">${cost.amount} ${resourceType.emoji}</span>`;
            });
            materialCostsHtml += '</div>';
        }
        
        upgradeItem.innerHTML = `
            <div class="upgrade-icon">${upgrade.emoji}</div>
            <div class="upgrade-info">
                <div class="upgrade-name">${upgrade.name}</div>
                <div class="upgrade-description">${upgrade.description}</div>
                <div class="upgrade-cost ${canAfford ? 'can-afford' : 'cannot-afford'}">
                    Cost: ${upgrade.cost} nautical miles
                </div>
                ${materialCostsHtml}
            </div>
        `;
        
        // Add click event to install the upgrade
        upgradeItem.addEventListener('click', () => {
            installUpgrade(upgrade.id, slotIndex);
            upgradeMenu.remove();
        });
        
        // Disable if can't afford either nautical miles or materials
        if (!canAfford || !hasEnoughMats) {
            upgradeItem.classList.add('disabled');
            upgradeItem.title = !canAfford ? "Not enough nautical miles" : "Not enough materials";
        }
        
        upgradesList.appendChild(upgradeItem);
    });
    
    upgradeMenu.appendChild(upgradesList);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'upgrade-menu-close';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        upgradeMenu.remove();
    });
    upgradeMenu.appendChild(closeButton);
    
    // Position the menu near the clicked square
    const squareRect = square.getBoundingClientRect();
    document.body.appendChild(upgradeMenu);
    
    const menuRect = upgradeMenu.getBoundingClientRect();
    
    // Position the menu centered above the square
    upgradeMenu.style.left = `${squareRect.left + (squareRect.width / 2) - (menuRect.width / 2)}px`;
    upgradeMenu.style.top = `${squareRect.top - menuRect.height - 10}px`;
    
    // Make sure the menu is fully visible
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position if needed
    if (parseFloat(upgradeMenu.style.left) < 10) {
        upgradeMenu.style.left = '10px';
    } else if (parseFloat(upgradeMenu.style.left) + menuRect.width > viewportWidth - 10) {
        upgradeMenu.style.left = `${viewportWidth - menuRect.width - 10}px`;
    }
    
    // Adjust vertical position if needed
    if (parseFloat(upgradeMenu.style.top) < 10) {
        upgradeMenu.style.top = `${squareRect.bottom + 10}px`;
    }
    
    // Add animation class
    setTimeout(() => {
        upgradeMenu.classList.add('visible');
    }, 10);
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenuOnClickOutside(event) {
        if (!upgradeMenu.contains(event.target) && event.target !== square) {
            upgradeMenu.remove();
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    });
}

// Install an upgrade in a schematic slot
function installUpgrade(upgradeId, slotIndex) {
    // Find the upgrade configuration
    const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === upgradeId);
    if (!upgradeConfig) return;
    
    // Check if player has enough nautical miles
    if (gameState.distance < upgradeConfig.cost) {
        showNotification(`Not enough nautical miles to install ${upgradeConfig.name}. Need ${upgradeConfig.cost}.`, "error");
        return;
    }
    
    // Check if player has enough materials
    if (!hasEnoughMaterials(upgradeConfig.materialCosts)) {
        let errorMessage = `Not enough materials to install ${upgradeConfig.name}. Need: `;
        upgradeConfig.materialCosts.forEach((cost, index) => {
            const resourceType = resourceTypes.find(r => r.id === cost.id);
            errorMessage += `${cost.amount} ${resourceType.name}`;
            if (index < upgradeConfig.materialCosts.length - 1) {
                errorMessage += ", ";
            }
        });
        showNotification(errorMessage, "error");
        return;
    }
    
    // Deduct the costs
    gameState.distance -= upgradeConfig.cost;
    deductMaterials(upgradeConfig.materialCosts);
    
    // Add the upgrade to installed upgrades
    gameState.installedUpgrades.push({
        upgradeId: upgradeId,
        slotIndex: slotIndex,
        installedAt: new Date().toISOString(),
        materialCosts: upgradeConfig.materialCosts // Store the material costs for refund when selling
    });
    
    // Show success message
    showNotification(`Successfully installed ${upgradeConfig.name}!`, "success");
    
    // Add to event history
    addEvent(`Installed ${upgradeConfig.name} in vessel slot ${slotIndex + 1}`);
    
    // Update UI
    updateUI();
    updateVesselSchematic(vesselTypes[gameState.currentVesselIndex]);
    
    // If this is a map upgrade, immediately process the map display
    if (upgradeId === 'map') {
        processMapDisplay();
    }
    
    // Save game state
    saveGameState();
}

// Process automatic discovery collection based on installed upgrades
function processAutomaticDiscoveryCollection() {
    // Find all autocollector upgrades
    const autocollectors = gameState.installedUpgrades.filter(upgrade => {
        const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === upgrade.upgradeId);
        return upgradeConfig && upgradeConfig.effect.type === 'autocollect';
    });
    
    // If no autocollectors, do nothing
    if (autocollectors.length === 0) return;
    
    // For each discovery, check if it should be auto-collected
    const discoveriesToCollect = [];
    
    gameState.discoveries.forEach(discovery => {
        // For each autocollector, check if it triggers
        for (const collector of autocollectors) {
            const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === collector.upgradeId);
            
            // Roll for chance to collect
            if (Math.random() < upgradeConfig.effect.chance) {
                discoveriesToCollect.push(discovery.id);
                break; // Only collect once per discovery
            }
        }
    });
    
    // Collect the discoveries
    discoveriesToCollect.forEach(id => {
        // Find the discovery
        const discoveryIndex = gameState.discoveries.findIndex(d => d.id === id);
        if (discoveryIndex === -1) return;
        
        const discovery = gameState.discoveries[discoveryIndex];
        
        // Apply the distance bonus
        gameState.distance += discovery.type.bonus;
        
        // Check if this discovery provides a resource
        if (discovery.type.resource) {
            // Increment the resource count
            gameState.resources[discovery.type.resource]++;
            
            // Find the resource details
            const resourceDetails = resourceTypes.find(r => r.id === discovery.type.resource);
            if (resourceDetails) {
                // Add to event history
                addEvent(`Autocollector found ${discovery.type.name} (+${discovery.type.bonus} nautical miles, +1 ${resourceDetails.name})`);
            }
        } else {
            // Add to event history
            addEvent(`Autocollector found ${discovery.type.name} (+${discovery.type.bonus} nautical miles)`);
        }
        
        // Remove the discovery
        removeDiscovery(id, true);
    });
    
    // Update UI if any discoveries were collected
    if (discoveriesToCollect.length > 0) {
        updateUI();
        saveGameState();
    }
}

// Sell an installed upgrade
function sellUpgrade(upgradeId, slotIndex, sellValue) {
    // Find the upgrade in the installed upgrades array
    const upgradeIndex = gameState.installedUpgrades.findIndex(
        upgrade => upgrade.slotIndex === slotIndex && upgrade.upgradeId === upgradeId
    );
    
    if (upgradeIndex === -1) return;
    
    // Get the installed upgrade
    const installedUpgrade = gameState.installedUpgrades[upgradeIndex];
    
    // Find the upgrade configuration
    const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === upgradeId);
    if (!upgradeConfig) return;
    
    // Remove the upgrade from the array
    gameState.installedUpgrades.splice(upgradeIndex, 1);
    
    // Add the sell value to the player's distance
    gameState.distance += sellValue;
    
    // Return a portion of the materials (50%)
    let materialRefundMessage = "";
    if (installedUpgrade.materialCosts) {
        materialRefundMessage = " and ";
        installedUpgrade.materialCosts.forEach((cost, index) => {
            const refundAmount = Math.floor(cost.amount * 0.5); // Return 50% of materials
            if (refundAmount > 0) {
                gameState.resources[cost.id] += refundAmount;
                const resourceType = resourceTypes.find(r => r.id === cost.id);
                materialRefundMessage += `${refundAmount} ${resourceType.name}`;
                if (index < installedUpgrade.materialCosts.length - 1 &&
                    Math.floor(installedUpgrade.materialCosts[index + 1].amount * 0.5) > 0) {
                    materialRefundMessage += ", ";
                }
            }
        });
    }
    
    // Show success message
    showNotification(`Sold ${upgradeConfig.name} for ${sellValue} nautical miles${materialRefundMessage}!`, "success");
    
    // Add to event history
    addEvent(`Sold ${upgradeConfig.name} from vessel slot ${slotIndex + 1} for ${sellValue} nautical miles${materialRefundMessage}`);
    
    // Update UI
    updateUI();
    updateVesselSchematic(vesselTypes[gameState.currentVesselIndex]);
    
    // Save game state
    saveGameState();
}

// Show sell menu for an installed upgrade
function showSellMenu(slotIndex, existingUpgrade) {
    console.log("showSellMenu called", slotIndex, existingUpgrade);
    
    // Remove any existing menus
    const existingMenus = document.querySelectorAll('.upgrade-menu');
    existingMenus.forEach(menu => menu.remove());
    
    // Get the clicked square element
    const square = document.querySelector(`.vessel-square[data-index="${slotIndex}"]`);
    console.log("Square element:", square);
    if (!square) {
        console.error("Square element not found");
        return;
    }
    
    // Find the upgrade configuration
    const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === existingUpgrade.upgradeId);
    console.log("Upgrade config:", upgradeConfig);
    if (!upgradeConfig) {
        console.error("Upgrade configuration not found");
        return;
    }
    
    // Calculate sell value (2/3 of original cost)
    const sellValue = Math.floor(upgradeConfig.cost * (2/3));
    
    // Calculate material refunds (50% of original costs)
    let materialRefunds = "";
    if (existingUpgrade.materialCosts) {
        existingUpgrade.materialCosts.forEach((cost, index) => {
            const refundAmount = Math.floor(cost.amount * 0.5); // Return 50% of materials
            if (refundAmount > 0) {
                const resourceType = resourceTypes.find(r => r.id === cost.id);
                materialRefunds += `${refundAmount} ${resourceType.emoji}`;
                if (index < existingUpgrade.materialCosts.length - 1 &&
                    Math.floor(existingUpgrade.materialCosts[index + 1].amount * 0.5) > 0) {
                    materialRefunds += ", ";
                }
            }
        });
    }
    
    // Create the sell menu
    const sellMenu = document.createElement('div');
    sellMenu.className = 'upgrade-menu sell-menu';
    
    // Add title
    const menuTitle = document.createElement('div');
    menuTitle.className = 'upgrade-menu-title';
    menuTitle.textContent = 'Installed Upgrade';
    sellMenu.appendChild(menuTitle);
    
    // Add upgrade info
    const upgradeInfo = document.createElement('div');
    upgradeInfo.className = 'upgrade-item';
    upgradeInfo.innerHTML = `
        <div class="upgrade-icon">${upgradeConfig.emoji}</div>
        <div class="upgrade-info">
            <div class="upgrade-name">${upgradeConfig.name}</div>
            <div class="upgrade-description">${upgradeConfig.description}</div>
            <div class="upgrade-sell-value">
                Sell value: ${sellValue} nautical miles
                ${materialRefunds ? `<br>+ ${materialRefunds}` : ''}
            </div>
        </div>
    `;
    sellMenu.appendChild(upgradeInfo);
    
    // Add sell button
    const sellButton = document.createElement('button');
    sellButton.className = 'sell-upgrade-btn';
    sellButton.textContent = 'Sell Upgrade';
    sellButton.addEventListener('click', () => {
        sellUpgrade(existingUpgrade.upgradeId, slotIndex, sellValue);
        sellMenu.remove();
    });
    sellMenu.appendChild(sellButton);
    
    // Add close button
    const closeButton = document.createElement('button');
    closeButton.className = 'upgrade-menu-close';
    closeButton.textContent = 'Close';
    closeButton.addEventListener('click', () => {
        sellMenu.remove();
    });
    sellMenu.appendChild(closeButton);
    
    // Position the menu
    document.body.appendChild(sellMenu);
    
    // Get the position of the square
    const squareRect = square.getBoundingClientRect();
    
    // Position the menu near the square
    sellMenu.style.position = 'fixed';
    sellMenu.style.left = `${squareRect.left + squareRect.width + 10}px`;
    sellMenu.style.top = `${squareRect.top}px`;
    
    // Add animation class
    setTimeout(() => {
        console.log("Adding visible class to sell menu");
        sellMenu.classList.add('visible');
    }, 10);
    
    // Close menu when clicking outside
    document.addEventListener('click', function closeMenuOnClickOutside(event) {
        if (!sellMenu.contains(event.target) && event.target !== square) {
            sellMenu.remove();
            document.removeEventListener('click', closeMenuOnClickOutside);
        }
    });
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);

// Create and update the map grid
function createMapGrid() {
    // Check if map container already exists
    let mapContainer = document.getElementById('map-grid-container');
    
    // If it doesn't exist, create it
    if (!mapContainer) {
        mapContainer = document.createElement('div');
        mapContainer.id = 'map-grid-container';
        mapContainer.className = 'map-grid-container';
        
        // Add title
        const mapTitle = document.createElement('h3');
        mapTitle.textContent = 'Navigation Map';
        mapContainer.appendChild(mapTitle);
        
        // Create the grid
        const gridElement = document.createElement('div');
        gridElement.id = 'map-grid';
        gridElement.className = 'map-grid';
        mapContainer.appendChild(gridElement);
        
        // Add to the DOM before the discoveries container
        const discoveriesContainer = document.getElementById('discoveries-container');
        discoveriesContainer.parentNode.insertBefore(mapContainer, discoveriesContainer);
    }
    
    // Get the grid element
    const gridElement = document.getElementById('map-grid');
    
    // Clear existing grid
    gridElement.innerHTML = '';
    
    // Create the grid cells (5x9)
    const gridWidth = 5;
    const gridHeight = 9;
    
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = document.createElement('div');
            cell.className = 'map-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            
            // Mark the center cell as the vessel
            if (x === Math.floor(gridWidth / 2) && y === Math.floor(gridHeight / 2)) {
                cell.classList.add('vessel-cell');
                
                // Add vessel emoji based on current vessel
                const currentVessel = vesselTypes[gameState.currentVesselIndex];
                cell.textContent = currentVessel.emoji;
            }
            
            gridElement.appendChild(cell);
        }
    }
}

// Update the map with discoveries
function updateMapWithDiscoveries() {
    // Check if map is installed
    const hasMap = gameState.installedUpgrades.some(upgrade => {
        const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === upgrade.upgradeId);
        return upgradeConfig && upgradeConfig.effect.type === 'map';
    });
    
    // If no map, hide the map container and return
    const mapContainer = document.getElementById('map-grid-container');
    if (!hasMap) {
        if (mapContainer) {
            mapContainer.style.display = 'none';
        }
        return;
    }
    
    // Show the map container
    if (mapContainer) {
        mapContainer.style.display = 'block';
    } else {
        // Create the map grid if it doesn't exist
        createMapGrid();
    }
    
    // Get the grid element
    const gridElement = document.getElementById('map-grid');
    if (!gridElement) return;
    
    // Clear any existing discovery markers
    const existingMarkers = gridElement.querySelectorAll('.discovery-marker');
    existingMarkers.forEach(marker => marker.remove());
    
    // Grid dimensions
    const gridWidth = 5;
    const gridHeight = 9;
    
    // Center coordinates
    const centerX = Math.floor(gridWidth / 2);
    const centerY = Math.floor(gridHeight / 2);
    
    // Add discovery markers
    gameState.discoveries.forEach(discovery => {
        // Create a marker for the discovery
        const marker = document.createElement('div');
        marker.className = 'discovery-marker';
        marker.style.backgroundColor = discovery.type.color;
        marker.dataset.discoveryId = discovery.id;
        
        // Calculate position (start at a random edge position)
        let markerX, markerY;
        
        // If the marker already has a position, use it
        if (discovery.mapX !== undefined && discovery.mapY !== undefined) {
            markerX = discovery.mapX;
            markerY = discovery.mapY;
            
            // Move the marker closer to the center at a slower pace
            // Reduced from 0.1 to 0.05 to give players more time to interact
            if (markerX < centerX) markerX += 0.05;
            else if (markerX > centerX) markerX -= 0.05;
            
            if (markerY < centerY) markerY += 0.05;
            else if (markerY > centerY) markerY -= 0.05;
            
            // Check if marker has reached the center
            const distanceToCenter = Math.sqrt(
                Math.pow(markerX - centerX, 2) +
                Math.pow(markerY - centerY, 2)
            );
            
            // If the marker is very close to the center, make it clickable
            // Using a smaller threshold (0.3) to make it clickable only when very close to the vessel
            if (distanceToCenter < 0.3) {
                marker.classList.add('clickable');
                
                // Add click event to investigate
                marker.addEventListener('click', () => {
                    investigateDiscovery(discovery.id);
                });
            }
        } else {
            // Generate a random starting position at the edge
            const edge = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
            
            switch (edge) {
                case 0: // top
                    markerX = Math.random() * gridWidth;
                    markerY = 0;
                    break;
                case 1: // right
                    markerX = gridWidth - 1;
                    markerY = Math.random() * gridHeight;
                    break;
                case 2: // bottom
                    markerX = Math.random() * gridWidth;
                    markerY = gridHeight - 1;
                    break;
                case 3: // left
                    markerX = 0;
                    markerY = Math.random() * gridHeight;
                    break;
            }
        }
        
        // Update the discovery with the new position
        discovery.mapX = markerX;
        discovery.mapY = markerY;
        
        // Position the marker
        marker.style.left = `${(markerX / gridWidth) * 100}%`;
        marker.style.top = `${(markerY / gridHeight) * 100}%`;
        
        // Add the marker to the grid
        gridElement.appendChild(marker);
    });
}

// Process map display
function processMapDisplay() {
    // Check if map is installed
    const hasMap = gameState.installedUpgrades.some(upgrade => {
        const upgradeConfig = GAME_CONFIG.upgrades.find(u => u.id === upgrade.upgradeId);
        return upgradeConfig && upgradeConfig.effect.type === 'map';
    });
    
    if (hasMap) {
        // Create or update the map grid
        createMapGrid();
        // Update the map with discoveries
        updateMapWithDiscoveries();
    } else {
        // Hide the map if it exists
        const mapContainer = document.getElementById('map-grid-container');
        if (mapContainer) {
            mapContainer.style.display = 'none';
        }
    }
}

// Add autocollector and map processing to the sailing interval
const originalStartDrifting = startDrifting;
startDrifting = function(skipNotifications = false) {
    originalStartDrifting(skipNotifications);
    
    // Add autocollector processing
    const autoCollectInterval = setInterval(() => {
        if (gameState.isSailing) {
            processAutomaticDiscoveryCollection();
        }
    }, 5000); // Check every 5 seconds
    
    // Add map update processing
    const mapUpdateInterval = setInterval(() => {
        if (gameState.isSailing) {
            processMapDisplay();
        }
    }, 500); // Update map every half second for smoother movement
    
    // Store the interval IDs
    gameState.autoCollectInterval = autoCollectInterval;
    gameState.mapUpdateInterval = mapUpdateInterval;
};

// No need for additional anchor button handling code here
// The event listener is now properly set up with autocollector handling
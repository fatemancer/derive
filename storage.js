// Save game state to localStorage
function saveGameState() {
    const saveData = {
        distance: gameState.distance,
        isSailing: gameState.isSailing,
        eventHistory: gameState.eventHistory,
        reachedMilestones: gameState.reachedMilestones || [],
        currentVesselIndex: gameState.currentVesselIndex || 0,
        resources: gameState.resources || {
            seaweed: 0,
            wood: 0,
            plank: 0,
            cloth: 0,
            copper: 0
        },
        installedUpgrades: gameState.installedUpgrades || [],
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('oceanDriftingSave', JSON.stringify(saveData));
    
    // Show save notification
    showNotification("Game saved successfully! ✅", "success");
}

// Load game state from localStorage
function loadGameState() {
    const saveData = localStorage.getItem('oceanDriftingSave');
    if (!saveData) return false;
    
    try {
        const parsedData = JSON.parse(saveData);
        
        // Restore game state
        gameState.distance = parsedData.distance || 0;
        gameState.eventHistory = parsedData.eventHistory || [];
        gameState.reachedMilestones = parsedData.reachedMilestones || [];
        gameState.currentVesselIndex = parsedData.currentVesselIndex || 0;
        
        // Load resources or initialize with zeros if not present
        gameState.resources = parsedData.resources || {
            seaweed: 0,
            wood: 0,
            plank: 0,
            cloth: 0,
            copper: 0
        };
        
        // Load installed upgrades
        gameState.installedUpgrades = parsedData.installedUpgrades || [];
        
        // Update sailing state
        gameState.isSailing = parsedData.isSailing;
        
        // Always update button text and status based on loaded sailing state
        if (gameState.isSailing) {
            startDrifting(true); // Skip notifications during loading
            anchorBtn.textContent = "Drop Anchor";
        } else {
            clearInterval(gameState.sailingInterval);
            clearTimeout(gameState.discoveryInterval);
            anchorBtn.textContent = "Resume Journey";
            statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
        }
        
        // Update UI (skip notifications during loading)
        updateUI(true);
        
        return true;
    } catch (error) {
        console.error("Error loading save:", error);
        return false;
    }
}

// Export save data to a file
function exportSaveData() {
    const saveData = {
        distance: gameState.distance,
        isSailing: gameState.isSailing,
        eventHistory: gameState.eventHistory,
        reachedMilestones: gameState.reachedMilestones || [],
        currentVesselIndex: gameState.currentVesselIndex || 0,
        resources: gameState.resources || {
            seaweed: 0,
            wood: 0,
            plank: 0,
            cloth: 0,
            copper: 0
        },
        installedUpgrades: gameState.installedUpgrades || [],
        exportedAt: new Date().toISOString(),
        gameVersion: "1.3"
    };
    
    const dataStr = JSON.stringify(saveData, null, 2);
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);
    
    const exportFileName = `ocean-drifting-save-${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    showNotification("Game data exported successfully! 📤", "success");
}

// Import save data from a file
function importSaveData(file) {
    const reader = new FileReader();
    
    reader.onload = function(event) {
        try {
            const saveData = JSON.parse(event.target.result);
            
            // Validate the save data
            if (saveData.distance === undefined || saveData.eventHistory === undefined) {
                throw new Error("Invalid save file format");
            }
            
            // Stop current sailing if active
            if (gameState.isSailing) {
                clearInterval(gameState.sailingInterval);
                clearTimeout(gameState.discoveryInterval);
            }
            
            // Restore game state
            gameState.distance = saveData.distance;
            gameState.isSailing = saveData.isSailing;
            gameState.eventHistory = saveData.eventHistory;
            gameState.reachedMilestones = saveData.reachedMilestones || [];
            gameState.currentVesselIndex = saveData.currentVesselIndex || 0;
            
            // Load resources or initialize with zeros if not present
            gameState.resources = saveData.resources || {
                seaweed: 0,
                wood: 0,
                plank: 0,
                cloth: 0,
                copper: 0
            };
            
            // Load installed upgrades
            gameState.installedUpgrades = saveData.installedUpgrades || [];
            
            // Restart sailing if needed
            if (gameState.isSailing) {
                startDrifting(true); // Skip notifications during import
                anchorBtn.textContent = "Drop Anchor";
            } else {
                anchorBtn.textContent = "Resume Journey";
                statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
            }
            
            // Update UI (skip notifications during import)
            updateUI(true);
            
            // Add import event
            addEvent("Imported saved game data");
            
            showNotification("Game data imported successfully! 📥", "success");
            
        } catch (error) {
            console.error("Error importing save:", error);
            showNotification("Error importing save file. Invalid format. ❌", "error");
        }
    };
    
    reader.readAsText(file);
}
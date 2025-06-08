// Save game state to localStorage
function saveGameState() {
    const saveData = {
        distance: gameState.distance,
        isSailing: gameState.isSailing,
        eventHistory: gameState.eventHistory,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem('oceanDriftingSave', JSON.stringify(saveData));
    
    // Show brief save confirmation
    const originalText = statusMessage.textContent;
    statusMessage.textContent = "Game saved successfully!";
    setTimeout(() => {
        statusMessage.textContent = originalText;
    }, 2000);
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
        
        // Update sailing state if needed
        if (gameState.isSailing !== parsedData.isSailing) {
            gameState.isSailing = parsedData.isSailing;
            
            if (gameState.isSailing) {
                startDrifting();
                anchorBtn.textContent = "Drop Anchor";
            } else {
                clearInterval(gameState.sailingInterval);
                clearTimeout(gameState.discoveryInterval);
                anchorBtn.textContent = "Resume Journey";
                statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
            }
        }
        
        // Update UI
        updateUI();
        
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
        exportedAt: new Date().toISOString(),
        gameVersion: "1.0"
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
    
    statusMessage.textContent = "Game data exported successfully!";
    setTimeout(() => {
        if (gameState.isSailing) {
            statusMessage.textContent = "Your ship is drifting with the current. Keep an eye out for discoveries!";
        } else {
            statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
        }
    }, 2000);
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
            
            // Restart sailing if needed
            if (gameState.isSailing) {
                startDrifting();
                anchorBtn.textContent = "Drop Anchor";
            } else {
                anchorBtn.textContent = "Resume Journey";
                statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
            }
            
            // Update UI
            updateUI();
            
            // Add import event
            addEvent("Imported saved game data");
            
            statusMessage.textContent = "Game data imported successfully!";
            setTimeout(() => {
                if (gameState.isSailing) {
                    statusMessage.textContent = "Your ship is drifting with the current. Keep an eye out for discoveries!";
                } else {
                    statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
                }
            }, 2000);
            
        } catch (error) {
            console.error("Error importing save:", error);
            statusMessage.textContent = "Error importing save file. Invalid format.";
            setTimeout(() => {
                if (gameState.isSailing) {
                    statusMessage.textContent = "Your ship is drifting with the current. Keep an eye out for discoveries!";
                } else {
                    statusMessage.textContent = "Your ship is anchored. Resume your journey to continue drifting.";
                }
            }, 2000);
        }
    };
    
    reader.readAsText(file);
}
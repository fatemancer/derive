// UI configuration constants
const UI_CONFIG = {
    MAX_PERCENTAGE: 100,   // Maximum percentage for progress bar width
    MIN_LOG_VALUE: 1,      // Minimum value for logarithmic scale (to avoid log(0))
    LOG_BASE: 10           // Base for logarithmic scale (using powers of 10)
};

// Update UI to reflect current game state
function updateUI(skipNotifications = false) {
    // Update distance count
    distanceCount.textContent = gameState.distance;
    
    // Update progress bar
    updateProgressBar(skipNotifications);
    
    // Update resources display
    updateResourcesDisplay();
    
    // Update map display if the map upgrade is installed
    if (typeof processMapDisplay === 'function') {
        processMapDisplay();
    }
    
    // Note: We no longer update events display on every UI update
    // Events display is now only updated when new events are added
}

// Update the resources display
function updateResourcesDisplay() {
    // Update each resource count
    for (const resourceType of resourceTypes) {
        const resourceId = resourceType.id;
        const resourceCount = gameState.resources[resourceId] || 0;
        const resourceElement = document.getElementById(`resource-${resourceId}`);
        
        if (resourceElement) {
            // Check if the value has changed
            if (resourceElement.textContent !== resourceCount.toString()) {
                // Add animation class if the value increased
                if (parseInt(resourceElement.textContent) < resourceCount) {
                    resourceElement.classList.add('resource-gain');
                    
                    // Remove the class after animation completes
                    setTimeout(() => {
                        resourceElement.classList.remove('resource-gain');
                    }, 500);
                }
                
                // Update the value
                resourceElement.textContent = resourceCount;
            }
        }
    }
}

// Update progress bar based on distance using logarithmic scale
function updateProgressBar(skipNotifications = false) {
    const progressFill = document.getElementById('progress-fill');
    
    // Safely calculate percentage with logarithmic scale and proper bounds checking
    const distanceValue = Math.max(Number(gameState.distance) || 0, UI_CONFIG.MIN_LOG_VALUE);
    
    // Calculate logarithmic percentage:
    // 1. Get log of current distance and max distance
    // 2. Normalize to percentage (0-100)
    const logCurrent = Math.log10(distanceValue);
    const logMax = Math.log10(GAME_CONFIG.progression.maxDistance);
    const logPercentage = (logCurrent / logMax) * UI_CONFIG.MAX_PERCENTAGE;
    
    // Ensure percentage is within bounds
    const percentage = Math.min(
        Math.max(logPercentage, 0),
        UI_CONFIG.MAX_PERCENTAGE
    );
    
    // Apply the calculated width
    progressFill.style.width = `${percentage}%`;
    
    // Check for milestones from config
    const milestones = GAME_CONFIG.progression.milestones;
    for (const milestone of milestones) {
        if (gameState.distance >= milestone && !gameState.reachedMilestones?.includes(milestone)) {
            // Initialize reachedMilestones array if it doesn't exist
            if (!gameState.reachedMilestones) {
                gameState.reachedMilestones = [];
            }
            
            // Add milestone to reached milestones
            gameState.reachedMilestones.push(milestone);
            
            // Only show notifications and add events if not skipping notifications
            if (!skipNotifications) {
                showNotification(`Milestone reached: ${milestone} nautical miles! 🎉`, 'success');
                addEvent(`Reached ${milestone} nautical miles`);
            }
        }
    }
}

// Add an event to the history
function addEvent(message) {
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    
    const event = {
        time: timeString,
        message: message,
        timestamp: now.getTime()
    };
    
    // Add to the beginning of the array
    gameState.eventHistory.unshift(event);
    
    // Keep only the configured number of events
    if (gameState.eventHistory.length > GAME_CONFIG.ui.maxEventHistory) {
        gameState.eventHistory.pop();
    }
    
    // Update the display
    updateEventsDisplay();
}

// Update the events display
function updateEventsDisplay() {
    eventsContainer.innerHTML = '';
    
    gameState.eventHistory.forEach(event => {
        const eventElement = document.createElement('div');
        eventElement.className = 'event-item';
        eventElement.innerHTML = `<span class="event-time">${event.time}</span> ${event.message}`;
        eventsContainer.appendChild(eventElement);
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        notification.remove();
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('visible');
    }, 10);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('visible');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, GAME_CONFIG.ui.notificationDuration);
}
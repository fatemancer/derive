// Game configuration constants
const GAME_CONFIG = {
    MAX_DISTANCE: 1000000, // Maximum distance in nautical miles for full progress bar
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
    
    // Note: We no longer update events display on every UI update
    // Events display is now only updated when new events are added
}

// Update progress bar based on distance using logarithmic scale
function updateProgressBar(skipNotifications = false) {
    const progressFill = document.getElementById('progress-fill');
    
    // Safely calculate percentage with logarithmic scale and proper bounds checking
    const distanceValue = Math.max(Number(gameState.distance) || 0, GAME_CONFIG.MIN_LOG_VALUE);
    
    // Calculate logarithmic percentage:
    // 1. Get log of current distance and max distance
    // 2. Normalize to percentage (0-100)
    const logCurrent = Math.log10(distanceValue);
    const logMax = Math.log10(GAME_CONFIG.MAX_DISTANCE);
    const logPercentage = (logCurrent / logMax) * GAME_CONFIG.MAX_PERCENTAGE;
    
    // Ensure percentage is within bounds
    const percentage = Math.min(
        Math.max(logPercentage, 0),
        GAME_CONFIG.MAX_PERCENTAGE
    );
    
    // Apply the calculated width
    progressFill.style.width = `${percentage}%`;
    
    // Check for milestones
    const milestones = [10, 100, 1000, 10000, 100_000, 1_000_000];
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
    
    // Keep only the last 10 events
    if (gameState.eventHistory.length > 10) {
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
    }, 3000);
}
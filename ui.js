// Update UI to reflect current game state
function updateUI() {
    // Update distance count
    distanceCount.textContent = gameState.distance;
    
    // Update progress bar
    updateProgressBar();
    
    // Update events display
    updateEventsDisplay();
}

// Update progress bar based on distance
function updateProgressBar() {
    const progressFill = document.getElementById('progress-fill');
    const maxDistance = 100; // Maximum distance for full progress bar
    const percentage = Math.min((gameState.distance / maxDistance) * 100, 100);
    progressFill.style.width = `${percentage}%`;
    
    // Check for milestones
    const milestones = [10, 25, 50, 75, 100];
    for (const milestone of milestones) {
        if (gameState.distance >= milestone && !gameState.reachedMilestones?.includes(milestone)) {
            // Initialize reachedMilestones array if it doesn't exist
            if (!gameState.reachedMilestones) {
                gameState.reachedMilestones = [];
            }
            
            // Add milestone to reached milestones
            gameState.reachedMilestones.push(milestone);
            
            // Show milestone notification
            showNotification(`Milestone reached: ${milestone} nautical miles! 🎉`, 'success');
            addEvent(`Reached ${milestone} nautical miles`);
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
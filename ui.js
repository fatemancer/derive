// Update UI to reflect current game state
function updateUI() {
    // Update distance count
    distanceCount.textContent = gameState.distance;
    
    // Update events display
    updateEventsDisplay();
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
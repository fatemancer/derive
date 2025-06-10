// Game state object to track everything
const gameState = {
    distance: 0,
    discoveries: [],
    nextDiscoveryId: 0,
    isSailing: true,
    sailingInterval: null,
    discoveryInterval: null,
    eventHistory: [] // Array to store the last 10 events
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
    // Update distance every 2 seconds
    gameState.sailingInterval = setInterval(() => {
        gameState.distance += 1;
        updateUI(false); // Always show notifications during normal gameplay
        
        // Save game state every 10 distance units
        if (gameState.distance % 10 === 0) {
            saveGameState();
        }
    }, 2000);
    
    // Schedule discoveries every 15-30 seconds
    scheduleNextDiscovery();
    
    // Update status message
    statusMessage.textContent = "Your ship is drifting with the current. Keep an eye out for discoveries!";
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
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
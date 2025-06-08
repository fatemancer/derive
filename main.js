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
        startDrifting();
        anchorBtn.textContent = "Drop Anchor";
    }
});

// Start automatic drifting
function startDrifting() {
    // Update distance every 2 seconds
    gameState.sailingInterval = setInterval(() => {
        gameState.distance += 1;
        updateUI();
        
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
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
});

// Close menu when clicking outside
document.addEventListener('click', (event) => {
    if (!menu.contains(event.target) && event.target !== menuBtn) {
        menu.style.display = 'none';
    }
});

// Save button event listener
saveBtn.addEventListener('click', () => {
    saveGameState();
    menu.style.display = 'none';
});

// Export button event listener
exportBtn.addEventListener('click', () => {
    exportSaveData();
    menu.style.display = 'none';
});

// Import button event listener
importBtn.addEventListener('click', () => {
    fileInput.click();
    menu.style.display = 'none';
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
        startDrifting();
        addEvent("Started a new journey");
    } else {
        addEvent("Loaded saved game");
    }
    
    // Initialize particles
    createParticles();
}

// Initialize the game when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initGame);
/**
 * Main Game Script
 * Initializes and starts the game
 */

// Main Game class
class RaftDrifterGame {
    constructor() {
        // Game managers
        this.resourceManager = null;
        this.raftManager = null;
        this.uiManager = null;
        
        // Game state
        this.initialized = false;
        this.autoSaveInterval = null;
    }
    
    /**
     * Initialize the game
     */
    init() {
        console.log('Initializing Raft Drifter...');
        
        // Initialize managers
        this.resourceManager = new ResourceManager();
        this.resourceManager.init();
        
        this.raftManager = new RaftManager(this.resourceManager);
        this.raftManager.init();
        
        this.uiManager = new UIManager(this.resourceManager, this.raftManager);
        this.uiManager.init();
        
        // Initialize game loop
        GameLoop.init();
        
        // Try to load saved game
        this.loadGame();
        
        // Set up auto-save
        this.setupAutoSave();
        
        // Add event listeners
        this.setupEventListeners();
        
        this.initialized = true;
        console.log('Game initialized');
        
        // Publish game init event
        EventSystem.publish(EVENTS.GAME_INIT, {
            timestamp: TimeUtils.getCurrentTime()
        });
    }
    
    /**
     * Start the game
     */
    start() {
        if (!this.initialized) {
            this.init();
        }
        
        // Start the game loop
        GameLoop.start();
        
        console.log('Game started');
    }
    
    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Listen for save button
        document.addEventListener('keydown', (event) => {
            // Save on Ctrl+S
            if (event.ctrlKey && event.key === 's') {
                event.preventDefault();
                this.saveGame();
            }
        });
        
        // Listen for game events
        EventSystem.subscribe(EVENTS.GAME_TICK, (data) => {
            // Update game state on tick
        });
    }
    
    /**
     * Set up auto-save
     */
    setupAutoSave() {
        // Auto-save every minute
        this.autoSaveInterval = SaveSystem.setupAutoSave(() => this.getGameState(), 60000);
    }
    
    /**
     * Save the game
     */
    saveGame() {
        const gameState = this.getGameState();
        const success = SaveSystem.saveGame(gameState);
        
        if (success) {
            // Show save notification
            this.showNotification('Game saved');
        } else {
            this.showNotification('Failed to save game', 'error');
        }
        
        return success;
    }
    
    /**
     * Load the game
     */
    loadGame() {
        if (!SaveSystem.hasSave()) {
            console.log('No save found, starting new game');
            return false;
        }
        
        const gameState = SaveSystem.loadGame();
        if (!gameState) {
            console.error('Failed to load game');
            return false;
        }
        
        // Load game state into managers
        if (gameState.resources) {
            this.resourceManager.deserialize(gameState.resources);
        }
        
        if (gameState.raft) {
            this.raftManager.deserialize(gameState.raft);
        }
        
        // Refresh UI
        if (this.uiManager) {
            this.uiManager.refreshUI();
        }
        
        this.showNotification('Game loaded');
        return true;
    }
    
    /**
     * Reset the game
     */
    resetGame() {
        // Clear save
        SaveSystem.deleteSave();
        
        // Reload the page to reset everything
        window.location.reload();
    }
    
    /**
     * Get the current game state for saving
     * @returns {Object} - The game state
     */
    getGameState() {
        return {
            version: CONFIG.GAME_VERSION,
            timestamp: TimeUtils.getCurrentTime(),
            resources: this.resourceManager.serialize(),
            raft: this.raftManager.serialize()
        };
    }
    
    /**
     * Show a notification to the player
     * @param {string} message - The message to show
     * @param {string} type - The type of notification (info, success, error)
     */
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add to document
        document.body.appendChild(notification);
        
        // Remove after a delay
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
            }, 500);
        }, 2000);
    }
}

// Initialize the game when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create and start the game
    window.game = new RaftDrifterGame();
    window.game.start();
});
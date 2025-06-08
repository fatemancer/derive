/**
 * Save System
 * Handles saving and loading game data
 */

const SaveSystem = {
    /**
     * Save game data to local storage
     * @param {Object} gameState - The game state to save
     * @returns {boolean} - True if save was successful
     */
    saveGame: function(gameState) {
        try {
            const saveData = {
                version: CONFIG.GAME_VERSION,
                timestamp: Date.now(),
                state: gameState
            };
            
            const saveString = JSON.stringify(saveData);
            localStorage.setItem(CONFIG.SAVE_KEY, saveString);
            
            console.log('Game saved successfully');
            EventSystem.publish(EVENTS.GAME_SAVE, saveData);
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    },
    
    /**
     * Load game data from local storage
     * @returns {Object|null} - The loaded game state or null if no save exists
     */
    loadGame: function() {
        try {
            const saveString = localStorage.getItem(CONFIG.SAVE_KEY);
            if (!saveString) {
                console.log('No save data found');
                return null;
            }
            
            const saveData = JSON.parse(saveString);
            
            // Check for version compatibility
            if (saveData.version !== CONFIG.GAME_VERSION) {
                console.warn(`Save version (${saveData.version}) differs from game version (${CONFIG.GAME_VERSION})`);
                // In a more complex game, you might add migration logic here
            }
            
            console.log('Game loaded successfully');
            EventSystem.publish(EVENTS.GAME_LOAD, saveData);
            return saveData.state;
        } catch (error) {
            console.error('Failed to load game:', error);
            return null;
        }
    },
    
    /**
     * Check if a save exists
     * @returns {boolean} - True if a save exists
     */
    hasSave: function() {
        return localStorage.getItem(CONFIG.SAVE_KEY) !== null;
    },
    
    /**
     * Delete the saved game
     * @returns {boolean} - True if deletion was successful
     */
    deleteSave: function() {
        try {
            localStorage.removeItem(CONFIG.SAVE_KEY);
            console.log('Save deleted successfully');
            return true;
        } catch (error) {
            console.error('Failed to delete save:', error);
            return false;
        }
    },
    
    /**
     * Auto-save the game at regular intervals
     * @param {Function} getStateCallback - Function that returns the current game state
     * @param {number} interval - Time between auto-saves in milliseconds
     * @returns {number} - Interval ID for clearing if needed
     */
    setupAutoSave: function(getStateCallback, interval = 60000) {
        return setInterval(() => {
            this.saveGame(getStateCallback());
        }, interval);
    }
};
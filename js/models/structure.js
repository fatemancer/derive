/**
 * Structure Model
 * Defines the structures that can be built on the raft
 */

class Structure {
    /**
     * Create a new structure
     * @param {string} id - Unique identifier for the structure
     * @param {Object} config - Configuration for the structure
     */
    constructor(id, config) {
        this.id = id;
        this.name = config.name || id;
        this.description = config.description || '';
        this.icon = config.icon || '🏗️';
        this.level = 0;
        this.maxLevel = config.maxLevel || 1;
        this.built = false;
        this.unlocked = config.unlocked || false;
        this.position = config.position || { x: 0, y: 0 };
        this.size = config.size || { width: 1, height: 1 };
        this.effects = config.effects || {};
        this.costs = config.costs || {};
        this.upgradeCosts = config.upgradeCosts || [];
    }
    
    /**
     * Check if the structure can be built
     * @param {Object} resources - Available resources
     * @returns {boolean} - True if the structure can be built
     */
    canBuild(resources) {
        if (this.built) return false;
        
        // Check if we have enough resources
        for (const [resourceId, amount] of Object.entries(this.costs)) {
            if (!resources[resourceId] || resources[resourceId].amount < amount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Build the structure
     * @param {Object} resources - Available resources
     * @returns {boolean} - True if the structure was built
     */
    build(resources) {
        if (!this.canBuild(resources)) return false;
        
        // Consume resources
        for (const [resourceId, amount] of Object.entries(this.costs)) {
            resources[resourceId].remove(amount);
        }
        
        this.built = true;
        this.level = 1;
        
        return true;
    }
    
    /**
     * Check if the structure can be upgraded
     * @param {Object} resources - Available resources
     * @returns {boolean} - True if the structure can be upgraded
     */
    canUpgrade(resources) {
        if (!this.built) return false;
        if (this.level >= this.maxLevel) return false;
        
        const upgradeCost = this.upgradeCosts[this.level - 1];
        if (!upgradeCost) return false;
        
        // Check if we have enough resources
        for (const [resourceId, amount] of Object.entries(upgradeCost)) {
            if (!resources[resourceId] || resources[resourceId].amount < amount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Upgrade the structure
     * @param {Object} resources - Available resources
     * @returns {boolean} - True if the structure was upgraded
     */
    upgrade(resources) {
        if (!this.canUpgrade(resources)) return false;
        
        const upgradeCost = this.upgradeCosts[this.level - 1];
        
        // Consume resources
        for (const [resourceId, amount] of Object.entries(upgradeCost)) {
            resources[resourceId].remove(amount);
        }
        
        this.level++;
        
        return true;
    }
    
    /**
     * Get the current effects of the structure
     * @returns {Object} - Current effects based on level
     */
    getCurrentEffects() {
        if (!this.built) return {};
        
        const currentEffects = {};
        
        for (const [effectName, baseValue] of Object.entries(this.effects)) {
            // Scale effect by level (simple linear scaling for now)
            currentEffects[effectName] = baseValue * this.level;
        }
        
        return currentEffects;
    }
    
    /**
     * Serialize the structure for saving
     * @returns {Object} - Serialized structure data
     */
    serialize() {
        return {
            id: this.id,
            built: this.built,
            level: this.level,
            unlocked: this.unlocked,
            position: this.position
        };
    }
    
    /**
     * Deserialize saved data into this structure
     * @param {Object} data - Saved structure data
     */
    deserialize(data) {
        if (!data) return;
        
        this.built = data.built || false;
        this.level = data.level || 0;
        this.unlocked = data.unlocked || false;
        this.position = data.position || { x: 0, y: 0 };
    }
}
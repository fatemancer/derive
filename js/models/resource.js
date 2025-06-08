/**
 * Resource Model
 * Defines the structure and behavior of game resources
 */

class Resource {
    /**
     * Create a new resource
     * @param {string} id - Unique identifier for the resource
     * @param {Object} config - Configuration for the resource
     */
    constructor(id, config) {
        this.id = id;
        this.name = config.name || id;
        this.description = config.description || '';
        this.icon = config.icon || '📦';
        this.amount = 0;
        this.baseValue = config.baseValue || 1;
        this.clickValue = config.clickValue || 1;
        this.maxStorage = config.maxStorage || Infinity;
        this.unlocked = config.unlocked || false;
        this.perSecond = config.perSecond || 0;
        this.lastUpdated = TimeUtils.getCurrentTime();
    }
    
    /**
     * Add an amount to the resource
     * @param {number} amount - Amount to add
     * @returns {number} - Actual amount added (may be less due to storage limit)
     */
    add(amount) {
        if (amount <= 0) return 0;
        
        const oldAmount = this.amount;
        this.amount = Math.min(this.amount + amount, this.maxStorage);
        const actualAdded = this.amount - oldAmount;
        
        return actualAdded;
    }
    
    /**
     * Remove an amount from the resource
     * @param {number} amount - Amount to remove
     * @returns {boolean} - True if the full amount was removed
     */
    remove(amount) {
        if (amount <= 0) return true;
        if (this.amount < amount) return false;
        
        this.amount -= amount;
        return true;
    }
    
    /**
     * Check if there's enough of this resource
     * @param {number} amount - Amount to check
     * @returns {boolean} - True if there's enough
     */
    hasEnough(amount) {
        return this.amount >= amount;
    }
    
    /**
     * Update the resource based on time passed
     * @param {number} deltaTime - Time passed in milliseconds
     */
    update(deltaTime) {
        if (this.perSecond > 0) {
            const secondsPassed = deltaTime / 1000;
            this.add(this.perSecond * secondsPassed);
        }
        
        this.lastUpdated = TimeUtils.getCurrentTime();
    }
    
    /**
     * Get the percentage of storage used
     * @returns {number} - Percentage of storage used (0-100)
     */
    getStoragePercentage() {
        if (this.maxStorage === Infinity) return 0;
        return (this.amount / this.maxStorage) * 100;
    }
    
    /**
     * Serialize the resource for saving
     * @returns {Object} - Serialized resource data
     */
    serialize() {
        return {
            id: this.id,
            amount: this.amount,
            unlocked: this.unlocked,
            perSecond: this.perSecond,
            lastUpdated: this.lastUpdated
        };
    }
    
    /**
     * Deserialize saved data into this resource
     * @param {Object} data - Saved resource data
     */
    deserialize(data) {
        if (!data) return;
        
        this.amount = data.amount || 0;
        this.unlocked = data.unlocked || false;
        this.perSecond = data.perSecond || 0;
        this.lastUpdated = data.lastUpdated || TimeUtils.getCurrentTime();
    }
}
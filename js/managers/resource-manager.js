/**
 * Resource Manager
 * Manages all resources in the game
 */

class ResourceManager {
    /**
     * Create a new resource manager
     */
    constructor() {
        this.resources = {};
        this.initialized = false;
        
        // Subscribe to game events
        EventSystem.subscribe(EVENTS.GAME_TICK, (data) => this.update(data.deltaTime));
    }
    
    /**
     * Initialize resources from configuration
     */
    init() {
        if (this.initialized) return;
        
        // Create resources from config
        for (const [resourceId, resourceConfig] of Object.entries(CONFIG.RESOURCES)) {
            this.resources[resourceId] = new Resource(resourceId, resourceConfig);
        }
        
        // Set initial resource amounts
        for (const [resourceId, amount] of Object.entries(CONFIG.INITIAL_RESOURCES)) {
            if (this.resources[resourceId]) {
                this.resources[resourceId].amount = amount;
                this.resources[resourceId].unlocked = true;
            }
        }
        
        this.initialized = true;
        console.log('Resource Manager initialized');
    }
    
    /**
     * Update all resources
     * @param {number} deltaTime - Time passed since last update in milliseconds
     */
    update(deltaTime) {
        for (const resource of Object.values(this.resources)) {
            if (resource.unlocked) {
                resource.update(deltaTime);
            }
        }
        
        // Notify UI of resource updates
        EventSystem.publish(EVENTS.RESOURCE_UPDATED, this.resources);
    }
    
    /**
     * Get a resource by ID
     * @param {string} resourceId - ID of the resource to get
     * @returns {Resource|null} - The resource or null if not found
     */
    getResource(resourceId) {
        return this.resources[resourceId] || null;
    }
    
    /**
     * Add an amount to a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to add
     * @returns {number} - Actual amount added
     */
    addResource(resourceId, amount) {
        const resource = this.getResource(resourceId);
        if (!resource) return 0;
        
        const amountAdded = resource.add(amount);
        
        if (amountAdded > 0) {
            EventSystem.publish(EVENTS.RESOURCE_COLLECTED, {
                resourceId: resourceId,
                amount: amountAdded
            });
        }
        
        return amountAdded;
    }
    
    /**
     * Remove an amount from a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to remove
     * @returns {boolean} - True if the full amount was removed
     */
    removeResource(resourceId, amount) {
        const resource = this.getResource(resourceId);
        if (!resource) return false;
        
        return resource.remove(amount);
    }
    
    /**
     * Check if there's enough of a resource
     * @param {string} resourceId - ID of the resource
     * @param {number} amount - Amount to check
     * @returns {boolean} - True if there's enough
     */
    hasEnoughResource(resourceId, amount) {
        const resource = this.getResource(resourceId);
        if (!resource) return false;
        
        return resource.hasEnough(amount);
    }
    
    /**
     * Check if there are enough resources for a cost object
     * @param {Object} costs - Object mapping resource IDs to amounts
     * @returns {boolean} - True if there are enough resources
     */
    hasEnoughResources(costs) {
        for (const [resourceId, amount] of Object.entries(costs)) {
            if (!this.hasEnoughResource(resourceId, amount)) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Consume resources based on a cost object
     * @param {Object} costs - Object mapping resource IDs to amounts
     * @returns {boolean} - True if all resources were consumed
     */
    consumeResources(costs) {
        // First check if we have enough of all resources
        if (!this.hasEnoughResources(costs)) {
            return false;
        }
        
        // Then consume all resources
        for (const [resourceId, amount] of Object.entries(costs)) {
            this.removeResource(resourceId, amount);
        }
        
        return true;
    }
    
    /**
     * Unlock a resource
     * @param {string} resourceId - ID of the resource to unlock
     */
    unlockResource(resourceId) {
        const resource = this.getResource(resourceId);
        if (resource) {
            resource.unlocked = true;
        }
    }
    
    /**
     * Serialize all resources for saving
     * @returns {Object} - Serialized resource data
     */
    serialize() {
        const data = {};
        
        for (const [resourceId, resource] of Object.entries(this.resources)) {
            data[resourceId] = resource.serialize();
        }
        
        return data;
    }
    
    /**
     * Deserialize saved data into resources
     * @param {Object} data - Saved resource data
     */
    deserialize(data) {
        if (!data) return;
        
        for (const [resourceId, resourceData] of Object.entries(data)) {
            if (this.resources[resourceId]) {
                this.resources[resourceId].deserialize(resourceData);
            }
        }
    }
}
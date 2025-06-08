/**
 * Raft Manager
 * Manages the raft state, size, and structures
 */

class RaftManager {
    /**
     * Create a new raft manager
     * @param {ResourceManager} resourceManager - Reference to the resource manager
     */
    constructor(resourceManager) {
        this.resourceManager = resourceManager;
        this.size = CONFIG.RAFT.INITIAL_SIZE;
        this.maxSize = CONFIG.RAFT.MAX_SIZE;
        this.structures = {};
        this.initialized = false;
        
        // Grid representation of the raft
        this.grid = [];
        
        // Subscribe to game events
        EventSystem.subscribe(EVENTS.GAME_TICK, (data) => this.update(data.deltaTime));
    }
    
    /**
     * Initialize the raft
     */
    init() {
        if (this.initialized) return;
        
        // Initialize the grid based on initial size
        this.initializeGrid();
        
        this.initialized = true;
        console.log('Raft Manager initialized');
    }
    
    /**
     * Initialize the grid based on current raft size
     */
    initializeGrid() {
        this.grid = [];
        
        // Create a grid based on raft size
        // For simplicity, we'll use a square grid where size determines both width and height
        for (let y = 0; y < this.size; y++) {
            const row = [];
            for (let x = 0; x < this.size; x++) {
                row.push({
                    x: x,
                    y: y,
                    structureId: null,
                    type: 'raft' // Basic raft tile
                });
            }
            this.grid.push(row);
        }
    }
    
    /**
     * Update the raft
     * @param {number} deltaTime - Time passed since last update in milliseconds
     */
    update(deltaTime) {
        // Update structures if needed
        for (const structure of Object.values(this.structures)) {
            // Future: Add structure-specific update logic here
        }
    }
    
    /**
     * Check if the raft can be expanded
     * @returns {boolean} - True if the raft can be expanded
     */
    canExpand() {
        console.log('Checking if raft can expand...');
        
        if (this.size >= this.maxSize) {
            console.log('Cannot expand: max size reached');
            return false;
        }
        
        // Get the cost for the next expansion
        const expansionCost = CONFIG.RAFT.EXPANSION_COSTS[this.size - 1];
        if (!expansionCost) {
            console.log('Cannot expand: no expansion cost defined');
            return false;
        }
        
        console.log('Expansion cost:', expansionCost);
        
        // Check if we have enough resources
        const hasEnough = this.resourceManager.hasEnoughResources(expansionCost);
        console.log('Has enough resources:', hasEnough);
        
        return hasEnough;
    }
    
    /**
     * Expand the raft
     * @returns {boolean} - True if the raft was expanded
     */
    expand() {
        console.log('Attempting to expand raft...');
        
        if (!this.canExpand()) {
            console.log('Cannot expand raft: conditions not met');
            return false;
        }
        
        // Get the cost for the next expansion
        const expansionCost = CONFIG.RAFT.EXPANSION_COSTS[this.size - 1];
        console.log('Using expansion cost:', expansionCost);
        
        // Consume resources
        const resourcesConsumed = this.resourceManager.consumeResources(expansionCost);
        console.log('Resources consumed:', resourcesConsumed);
        
        if (!resourcesConsumed) {
            console.log('Failed to consume resources');
            return false;
        }
        
        // Increase raft size
        const oldSize = this.size;
        this.size++;
        console.log(`Raft size increased from ${oldSize} to ${this.size}`);
        
        // Reinitialize the grid with the new size
        this.initializeGrid();
        console.log('Grid reinitialized with new size');
        
        // Notify of raft expansion
        console.log(`Raft expanded to size ${this.size}`);
        EventSystem.publish(EVENTS.RAFT_EXPANDED, {
            newSize: this.size
        });
        
        return true;
    }
    
    /**
     * Get the current raft size
     * @returns {number} - Current raft size
     */
    getSize() {
        return this.size;
    }
    
    /**
     * Get the maximum possible raft size
     * @returns {number} - Maximum raft size
     */
    getMaxSize() {
        return this.maxSize;
    }
    
    /**
     * Get the cost for the next expansion
     * @returns {Object|null} - Cost object or null if max size reached
     */
    getNextExpansionCost() {
        if (this.size >= this.maxSize) {
            return null;
        }
        
        return CONFIG.RAFT.EXPANSION_COSTS[this.size - 1];
    }
    
    /**
     * Check if a position is valid on the raft
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if the position is valid
     */
    isValidPosition(x, y) {
        return x >= 0 && x < this.size && y >= 0 && y < this.size;
    }
    
    /**
     * Check if a position is empty (no structure)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if the position is empty
     */
    isPositionEmpty(x, y) {
        if (!this.isValidPosition(x, y)) {
            return false;
        }
        
        return this.grid[y][x].structureId === null;
    }
    
    /**
     * Place a structure on the raft
     * @param {string} structureId - ID of the structure
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean} - True if the structure was placed
     */
    placeStructure(structureId, x, y) {
        const structure = this.structures[structureId];
        if (!structure) {
            return false;
        }
        
        // Check if the position is valid and empty
        if (!this.isPositionEmpty(x, y)) {
            return false;
        }
        
        // Update the grid
        this.grid[y][x].structureId = structureId;
        
        // Update the structure position
        structure.position = { x, y };
        
        // Notify of raft update
        EventSystem.publish(EVENTS.RAFT_UPDATED, {
            grid: this.grid
        });
        
        return true;
    }
    
    /**
     * Serialize the raft for saving
     * @returns {Object} - Serialized raft data
     */
    serialize() {
        const structureData = {};
        
        for (const [structureId, structure] of Object.entries(this.structures)) {
            structureData[structureId] = structure.serialize();
        }
        
        return {
            size: this.size,
            grid: this.grid,
            structures: structureData
        };
    }
    
    /**
     * Deserialize saved data into the raft
     * @param {Object} data - Saved raft data
     */
    deserialize(data) {
        if (!data) return;
        
        this.size = data.size || CONFIG.RAFT.INITIAL_SIZE;
        
        if (data.grid) {
            this.grid = data.grid;
        } else {
            this.initializeGrid();
        }
        
        if (data.structures) {
            for (const [structureId, structureData] of Object.entries(data.structures)) {
                if (this.structures[structureId]) {
                    this.structures[structureId].deserialize(structureData);
                }
            }
        }
    }
}
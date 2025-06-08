/**
 * Resource Display
 * Displays resource information in the UI
 */

class ResourceDisplay {
    /**
     * Create a new resource display
     * @param {HTMLElement} container - Container element for the display
     * @param {ResourceManager} resourceManager - Reference to the resource manager
     */
    constructor(container, resourceManager) {
        this.container = container;
        this.resourceManager = resourceManager;
        this.resourceElements = {};
        this.updateInterval = null;
    }
    
    /**
     * Initialize the resource display
     */
    init() {
        // Clear the container
        this.container.innerHTML = '';
        
        // Create elements for each unlocked resource
        for (const [resourceId, resource] of Object.entries(this.resourceManager.resources)) {
            if (resource.unlocked) {
                this.createResourceElement(resourceId, resource);
            }
        }
        
        // Set up regular updates
        this.updateInterval = setInterval(() => {
            this.update();
        }, CONFIG.UI.RESOURCE_UPDATE_RATE);
    }
    
    /**
     * Create an element for a resource
     * @param {string} resourceId - ID of the resource
     * @param {Resource} resource - The resource object
     */
    createResourceElement(resourceId, resource) {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'resource-item';
        resourceElement.dataset.resource = resourceId;
        
        resourceElement.innerHTML = `
            <div class="resource-icon">${resource.icon}</div>
            <div class="resource-details">
                <div class="resource-name">${resource.name}</div>
                <div class="resource-value" data-value="${resourceId}">0</div>
            </div>
        `;
        
        // Add tooltip with description
        if (resource.description) {
            resourceElement.title = resource.description;
        }
        
        this.container.appendChild(resourceElement);
        this.resourceElements[resourceId] = resourceElement;
    }
    
    /**
     * Update the resource display
     */
    update() {
        // Update existing resource elements
        for (const [resourceId, resource] of Object.entries(this.resourceManager.resources)) {
            // Check if resource is unlocked
            if (resource.unlocked) {
                // Create element if it doesn't exist
                if (!this.resourceElements[resourceId]) {
                    this.createResourceElement(resourceId, resource);
                }
                
                // Update the value
                const valueElement = this.resourceElements[resourceId].querySelector(`[data-value="${resourceId}"]`);
                if (valueElement) {
                    // Format the value
                    const formattedValue = MathUtils.formatNumber(Math.floor(resource.amount));
                    
                    // Only update if the value has changed
                    if (valueElement.textContent !== formattedValue) {
                        valueElement.textContent = formattedValue;
                    }
                    
                    // Add storage percentage if applicable
                    if (resource.maxStorage !== Infinity) {
                        const percentage = resource.getStoragePercentage();
                        valueElement.title = `${formattedValue} / ${MathUtils.formatNumber(resource.maxStorage)} (${percentage.toFixed(1)}%)`;
                    }
                }
                
                // Update color based on storage capacity
                if (resource.maxStorage !== Infinity) {
                    const percentage = resource.getStoragePercentage();
                    if (percentage > 90) {
                        this.resourceElements[resourceId].classList.add('storage-full');
                    } else {
                        this.resourceElements[resourceId].classList.remove('storage-full');
                    }
                }
            } else {
                // Remove element if resource is no longer unlocked
                if (this.resourceElements[resourceId]) {
                    this.resourceElements[resourceId].remove();
                    delete this.resourceElements[resourceId];
                }
            }
        }
    }
    
    /**
     * Clean up the resource display
     */
    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
}
/**
 * UI Manager
 * Coordinates all UI components and handles user interactions
 */

class UIManager {
    /**
     * Create a new UI manager
     * @param {ResourceManager} resourceManager - Reference to the resource manager
     * @param {RaftManager} raftManager - Reference to the raft manager
     */
    constructor(resourceManager, raftManager) {
        this.resourceManager = resourceManager;
        this.raftManager = raftManager;
        this.components = {};
        this.initialized = false;
        
        // DOM element references
        this.resourceDisplayElement = document.getElementById('resource-display');
        this.raftViewElement = document.getElementById('raft-view');
        this.actionButtonsElement = document.getElementById('action-buttons');
        
        // Subscribe to game events
        EventSystem.subscribe(EVENTS.RESOURCE_UPDATED, () => this.updateResourceDisplay());
        EventSystem.subscribe(EVENTS.RAFT_UPDATED, () => this.updateRaftView());
        EventSystem.subscribe(EVENTS.RAFT_EXPANDED, () => this.updateRaftView());
        EventSystem.subscribe(EVENTS.UI_REFRESH, () => this.refreshUI());
    }
    
    /**
     * Initialize the UI
     */
    init() {
        if (this.initialized) return;
        
        // Initialize UI components
        this.initResourceDisplay();
        this.initRaftView();
        this.initActionButtons();
        
        // Initial UI update
        this.refreshUI();
        
        this.initialized = true;
        console.log('UI Manager initialized');
    }
    
    /**
     * Initialize the resource display
     */
    initResourceDisplay() {
        // Clear existing content
        this.resourceDisplayElement.innerHTML = '';
        
        // Create resource display component
        this.components.resourceDisplay = new ResourceDisplay(
            this.resourceDisplayElement,
            this.resourceManager
        );
        
        this.components.resourceDisplay.init();
    }
    
    /**
     * Initialize the raft view
     */
    initRaftView() {
        // Create raft view component
        this.components.raftView = new RaftView(
            this.raftViewElement,
            this.raftManager
        );
        
        this.components.raftView.init();
    }
    
    /**
     * Initialize action buttons
     */
    initActionButtons() {
        // Clear existing content
        this.actionButtonsElement.innerHTML = '';
        
        // Create collect driftwood button
        const collectButton = document.createElement('button');
        collectButton.className = 'action-button';
        collectButton.innerHTML = `
            <div class="icon">${CONFIG.ACTIONS.collectDriftwood.icon}</div>
            <div class="label">${CONFIG.ACTIONS.collectDriftwood.name}</div>
        `;
        collectButton.title = CONFIG.ACTIONS.collectDriftwood.description;
        collectButton.addEventListener('click', () => this.collectDriftwood());
        this.actionButtonsElement.appendChild(collectButton);
        
        // Create expand raft button
        const expandButton = document.createElement('button');
        expandButton.className = 'action-button';
        expandButton.id = 'expand-raft-button';
        expandButton.innerHTML = `
            <div class="icon">${CONFIG.ACTIONS.expandRaft.icon}</div>
            <div class="label">${CONFIG.ACTIONS.expandRaft.name}</div>
        `;
        expandButton.title = CONFIG.ACTIONS.expandRaft.description;
        expandButton.addEventListener('click', () => this.expandRaft());
        this.actionButtonsElement.appendChild(expandButton);
        
        // Update button states
        this.updateActionButtons();
    }
    
    /**
     * Refresh the entire UI
     */
    refreshUI() {
        this.updateResourceDisplay();
        this.updateRaftView();
        this.updateActionButtons();
    }
    
    /**
     * Update the resource display
     */
    updateResourceDisplay() {
        if (this.components.resourceDisplay) {
            this.components.resourceDisplay.update();
        }
    }
    
    /**
     * Update the raft view
     */
    updateRaftView() {
        if (this.components.raftView) {
            this.components.raftView.update();
        }
    }
    
    /**
     * Update action buttons state
     */
    updateActionButtons() {
        // Update expand raft button
        const expandButton = document.getElementById('expand-raft-button');
        if (expandButton) {
            const canExpand = this.raftManager.canExpand();
            expandButton.disabled = !canExpand;
            
            // Update tooltip with cost information
            const expansionCost = this.raftManager.getNextExpansionCost();
            if (expansionCost) {
                let costText = 'Cost: ';
                for (const [resourceId, amount] of Object.entries(expansionCost)) {
                    const resource = this.resourceManager.getResource(resourceId);
                    if (resource) {
                        costText += `${resource.icon} ${amount} `;
                    }
                }
                expandButton.title = `${CONFIG.ACTIONS.expandRaft.description}\n${costText}`;
            }
        }
    }
    
    /**
     * Handle driftwood collection
     */
    collectDriftwood() {
        // Add driftwood to resources
        const driftwoodResource = this.resourceManager.getResource('driftwood');
        if (driftwoodResource) {
            const amountAdded = this.resourceManager.addResource('driftwood', driftwoodResource.clickValue);
            
            if (amountAdded > 0) {
                // Create a visual effect for collection
                this.createCollectionEffect('driftwood');
                
                // Notify of action performed
                EventSystem.publish(EVENTS.ACTION_PERFORMED, {
                    action: 'collectDriftwood',
                    result: {
                        resourceId: 'driftwood',
                        amount: amountAdded
                    }
                });
            }
        }
    }
    
    /**
     * Handle raft expansion
     */
    expandRaft() {
        console.log('Expand raft button clicked');
        console.log('Current driftwood:', this.resourceManager.getResource('driftwood').amount);
        console.log('Can expand:', this.raftManager.canExpand());
        
        const expanded = this.raftManager.expand();
        console.log('Raft expanded:', expanded);
        
        if (expanded) {
            // Notify of action performed
            EventSystem.publish(EVENTS.ACTION_PERFORMED, {
                action: 'expandRaft',
                result: {
                    newSize: this.raftManager.getSize()
                }
            });
            
            // Update UI
            this.refreshUI();
        }
    }
    
    /**
     * Create a visual effect for resource collection
     * @param {string} resourceId - ID of the collected resource
     */
    createCollectionEffect(resourceId) {
        const resource = this.resourceManager.getResource(resourceId);
        if (!resource) return;
        
        // Create a floating text element
        const floatingText = document.createElement('div');
        floatingText.className = 'floating-text collecting';
        floatingText.textContent = `+${resource.clickValue}`;
        
        // Position it near the resource display
        const resourceElement = document.querySelector(`.resource-item[data-resource="${resourceId}"]`);
        if (resourceElement) {
            const rect = resourceElement.getBoundingClientRect();
            floatingText.style.position = 'absolute';
            floatingText.style.left = `${rect.left + rect.width / 2}px`;
            floatingText.style.top = `${rect.top}px`;
            document.body.appendChild(floatingText);
            
            // Remove after animation completes
            setTimeout(() => {
                floatingText.remove();
            }, 1000);
        }
    }
}
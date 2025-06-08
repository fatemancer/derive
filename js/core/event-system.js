/**
 * Event System
 * Handles game-wide events using a publish-subscribe pattern
 */

const EventSystem = {
    // Store for event listeners
    listeners: {},
    
    /**
     * Subscribe to an event
     * @param {string} eventName - Name of the event to subscribe to
     * @param {Function} callback - Function to call when event is triggered
     * @returns {Function} - Unsubscribe function
     */
    subscribe: function(eventName, callback) {
        if (!this.listeners[eventName]) {
            this.listeners[eventName] = [];
        }
        
        this.listeners[eventName].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.listeners[eventName] = this.listeners[eventName].filter(
                listener => listener !== callback
            );
        };
    },
    
    /**
     * Publish an event
     * @param {string} eventName - Name of the event to publish
     * @param {*} data - Data to pass to event listeners
     */
    publish: function(eventName, data) {
        if (!this.listeners[eventName]) {
            return;
        }
        
        this.listeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    },
    
    /**
     * Remove all listeners for an event
     * @param {string} eventName - Name of the event to clear listeners for
     */
    clearListeners: function(eventName) {
        if (eventName) {
            delete this.listeners[eventName];
        } else {
            this.listeners = {};
        }
    }
};

// Define common game events
const EVENTS = {
    GAME_INIT: 'game:init',
    GAME_SAVE: 'game:save',
    GAME_LOAD: 'game:load',
    GAME_RESET: 'game:reset',
    GAME_TICK: 'game:tick',
    
    RESOURCE_UPDATED: 'resource:updated',
    RESOURCE_COLLECTED: 'resource:collected',
    
    RAFT_UPDATED: 'raft:updated',
    RAFT_EXPANDED: 'raft:expanded',
    
    UI_REFRESH: 'ui:refresh',
    
    ACTION_PERFORMED: 'action:performed',
    ACTION_COMPLETED: 'action:completed'
};
/**
 * Game Configuration and Constants
 * Contains all game settings, balancing values, and constants
 */

const CONFIG = {
    // Game settings
    GAME_VERSION: '0.1.0',
    SAVE_KEY: 'raft_drifter_save',
    TICK_RATE: 1000, // milliseconds between game ticks
    
    // Canvas settings
    CANVAS: {
        WIDTH: 800,
        HEIGHT: 500,
        BACKGROUND_COLOR: '#0a1a2a'
    },
    
    // Initial resources
    INITIAL_RESOURCES: {
        driftwood: 0
    },
    
    // Resource definitions
    RESOURCES: {
        driftwood: {
            name: 'Driftwood',
            description: 'Basic building material',
            icon: '🪵',
            baseValue: 1,
            clickValue: 2,
            maxStorage: 50
        }
    },
    
    // Raft settings
    RAFT: {
        INITIAL_SIZE: 1,
        MAX_SIZE: 10,
        EXPANSION_COSTS: [
            { driftwood: 3 },
            { driftwood: 50 },
            { driftwood: 100 },
            { driftwood: 200 },
            { driftwood: 400 },
            { driftwood: 800 },
            { driftwood: 1600 },
            { driftwood: 3200 },
            { driftwood: 6400 }
        ]
    },
    
    // Action definitions
    ACTIONS: {
        collectDriftwood: {
            name: 'Collect Driftwood',
            description: 'Manually collect driftwood from the water',
            icon: '🪵',
            cooldown: 0 // No cooldown for basic collection
        },
        expandRaft: {
            name: 'Expand Raft',
            description: 'Use resources to make your raft bigger',
            icon: '🔨',
            cooldown: 5000 // 5 seconds cooldown
        }
    },
    
    // UI settings
    UI: {
        RESOURCE_UPDATE_RATE: 100, // ms between resource display updates
        ANIMATION_SPEED: 1.0
    }
};
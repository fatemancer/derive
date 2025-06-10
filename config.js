// Game configuration
const GAME_CONFIG = {
    // Resources settings
    resources: [
        { id: 'seaweed', name: 'Seaweed', emoji: '🌿', rarity: 1 },
        { id: 'wood', name: 'Wood', emoji: '🪵', rarity: 2 },
        { id: 'plank', name: 'Plank', emoji: '📏', rarity: 3 },
        { id: 'cloth', name: 'Cloth', emoji: '🧵', rarity: 4 },
        { id: 'copper', name: 'Copper', emoji: '🔶', rarity: 5 }
    ],
    
    // Upgrades settings
    upgrades: [
        {
            id: 'autocollector',
            name: 'Autocollector',
            emoji: '🧲',
            description: 'Automatically collects discoveries with a 10% chance',
            cost: 100,
            materialCosts: [
                { id: 'wood', amount: 5 },
                { id: 'copper', amount: 2 }
            ],
            effect: {
                type: 'autocollect',
                chance: 0.1
            }
        }
    ],
    
    // Vessel settings
    vessels: [
        {
            id: 'raft',
            name: 'Raft',
            emoji: '🏊',
            description: 'A simple wooden raft',
            driftSpeed: 1,
            upgradeCost: 50,
            upgradeMaterialCosts: [
                { id: 'wood', amount: 10 },
                { id: 'seaweed', amount: 5 }
            ],
            upgradeMessage: "You've upgraded to a small boat! Drift speed increased.",
            schematicSquares: 1 // Raft has 1 square
        },
        {
            id: 'boat1',
            name: 'Small Boat',
            emoji: '🚣',
            description: 'A small rowing boat',
            driftSpeed: 2,
            upgradeCost: 200,
            upgradeMaterialCosts: [
                { id: 'wood', amount: 20 },
                { id: 'plank', amount: 10 },
                { id: 'cloth', amount: 5 }
            ],
            upgradeMessage: "You've upgraded to a sailing boat! Drift speed increased significantly.",
            schematicSquares: 4 // Small boat has 4 squares
        },
        {
            id: 'boat2',
            name: 'Sailing Boat',
            emoji: '⛵',
            description: 'A proper sailing boat with a sail',
            driftSpeed: 4,
            upgradeCost: null, // No more upgrades for now
            upgradeMaterialCosts: null,
            upgradeMessage: null,
            schematicSquares: 6 // Sailing boat has 6 squares
        }
    ],
    
    // Discovery settings
    discoveries: {
        minInterval: 25000,  // Minimum time between discoveries (ms) - increased from 15000
        maxInterval: 40000,  // Maximum time between discoveries (ms) - increased from 30000
        duration: 10000,     // How long discoveries remain visible (ms)
        types: [
            { name: "driftwood", color: "#8B4513", message: "You found driftwood! It can be used for repairs.", bonus: 2, resource: null },
            { name: "bottle", color: "#2E8B57", message: "You found a message in a bottle with ancient wisdom!", bonus: 3, resource: null },
            { name: "treasure", color: "#FFD700", message: "You found a small treasure chest with gold coins!", bonus: 5, resource: null },
            { name: "coral", color: "#FF6B6B", message: "You discovered a beautiful piece of coral!", bonus: 2, resource: null },
            { name: "seashell", color: "#E6E6FA", message: "You found a rare seashell!", bonus: 1, resource: null },
            { name: "starfish", color: "#FF7F50", message: "You discovered a vibrant starfish!", bonus: 2, resource: null },
            { name: "seaweed_discovery", color: "#3CB371", message: "You found some seaweed floating in the water!", bonus: 1, resource: "seaweed" },
            { name: "wood_discovery", color: "#8B4513", message: "You found a piece of wood floating by!", bonus: 2, resource: "wood" },
            { name: "plank_discovery", color: "#DEB887", message: "You discovered a well-crafted plank!", bonus: 3, resource: "plank" },
            { name: "cloth_discovery", color: "#B0C4DE", message: "You found a piece of cloth from a distant land!", bonus: 4, resource: "cloth" },
            { name: "copper_discovery", color: "#CD7F32", message: "You discovered a rare piece of copper!", bonus: 5, resource: "copper" }
        ]
    },
    
    // Game progression settings
    progression: {
        driftInterval: 2000,  // Time between drift updates (ms)
        saveInterval: 10,     // Save game every X distance units
        maxDistance: 1000000, // Maximum distance for progress bar
        milestones: [10, 100, 1000, 10000, 100000, 1000000]
    },
    
    // UI settings
    ui: {
        maxEventHistory: 10,  // Maximum number of events to show in history
        notificationDuration: 3000 // Duration of notifications (ms)
    }
};
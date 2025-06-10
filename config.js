// Game configuration
const GAME_CONFIG = {
    // Vessel settings
    vessels: [
        { 
            id: 'raft', 
            name: 'Raft', 
            emoji: '🏊', 
            description: 'A simple wooden raft', 
            driftSpeed: 1,
            upgradeCost: 50,
            upgradeMessage: "You've upgraded to a small boat! Drift speed increased."
        },
        { 
            id: 'boat1', 
            name: 'Small Boat', 
            emoji: '🚣', 
            description: 'A small rowing boat', 
            driftSpeed: 2,
            upgradeCost: 200,
            upgradeMessage: "You've upgraded to a sailing boat! Drift speed increased significantly."
        },
        { 
            id: 'boat2', 
            name: 'Sailing Boat', 
            emoji: '⛵', 
            description: 'A proper sailing boat with a sail', 
            driftSpeed: 4,
            upgradeCost: null, // No more upgrades for now
            upgradeMessage: null
        }
    ],
    
    // Discovery settings
    discoveries: {
        minInterval: 25000,  // Minimum time between discoveries (ms) - increased from 15000
        maxInterval: 40000,  // Maximum time between discoveries (ms) - increased from 30000
        duration: 10000,     // How long discoveries remain visible (ms)
        types: [
            { name: "driftwood", color: "#8B4513", message: "You found driftwood! It can be used for repairs.", bonus: 2 },
            { name: "bottle", color: "#2E8B57", message: "You found a message in a bottle with ancient wisdom!", bonus: 3 },
            { name: "treasure", color: "#FFD700", message: "You found a small treasure chest with gold coins!", bonus: 5 },
            { name: "coral", color: "#FF6B6B", message: "You discovered a beautiful piece of coral!", bonus: 2 },
            { name: "seashell", color: "#E6E6FA", message: "You found a rare seashell!", bonus: 1 },
            { name: "starfish", color: "#FF7F50", message: "You discovered a vibrant starfish!", bonus: 2 }
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
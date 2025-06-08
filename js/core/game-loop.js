/**
 * Game Loop
 * Handles the main game loop and update cycle
 */

const GameLoop = {
    // Game state
    running: false,
    lastTick: 0,
    tickInterval: null,
    animationFrameId: null,
    
    /**
     * Initialize the game loop
     * @param {number} tickRate - Milliseconds between game logic updates
     */
    init: function(tickRate = CONFIG.TICK_RATE) {
        this.tickRate = tickRate;
        this.lastTick = TimeUtils.getCurrentTime();
        
        // Subscribe to game events
        EventSystem.subscribe(EVENTS.GAME_RESET, () => this.reset());
    },
    
    /**
     * Start the game loop
     */
    start: function() {
        if (this.running) return;
        
        this.running = true;
        this.lastTick = TimeUtils.getCurrentTime();
        
        // Set up the tick interval for game logic
        this.tickInterval = setInterval(() => this.tick(), this.tickRate);
        
        // Set up the animation frame for rendering
        this.animationFrameId = requestAnimationFrame(() => this.render());
        
        console.log('Game loop started');
    },
    
    /**
     * Stop the game loop
     */
    stop: function() {
        if (!this.running) return;
        
        this.running = false;
        
        // Clear the tick interval
        if (this.tickInterval) {
            clearInterval(this.tickInterval);
            this.tickInterval = null;
        }
        
        // Cancel the animation frame
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        console.log('Game loop stopped');
    },
    
    /**
     * Reset the game loop
     */
    reset: function() {
        this.stop();
        this.init();
        this.start();
    },
    
    /**
     * Game logic tick
     * This runs at a fixed interval defined by tickRate
     */
    tick: function() {
        const currentTime = TimeUtils.getCurrentTime();
        const deltaTime = currentTime - this.lastTick;
        this.lastTick = currentTime;
        
        // Create tick data to pass to event listeners
        const tickData = {
            time: currentTime,
            deltaTime: deltaTime
        };
        
        // Publish tick event for other systems to respond to
        EventSystem.publish(EVENTS.GAME_TICK, tickData);
    },
    
    /**
     * Render frame
     * This runs as fast as the browser can refresh
     */
    render: function() {
        if (!this.running) return;
        
        // Update UI elements that need smooth animation
        // This will be handled by the UI manager
        
        // Request the next animation frame
        this.animationFrameId = requestAnimationFrame(() => this.render());
    },
    
    /**
     * Get the current game time
     * @returns {number} - Current game time in milliseconds
     */
    getGameTime: function() {
        return TimeUtils.getCurrentTime();
    }
};
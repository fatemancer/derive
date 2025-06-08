/**
 * Raft View
 * Displays the raft using HTML5 Canvas
 */

class RaftView {
    /**
     * Create a new raft view
     * @param {HTMLElement} container - Container element for the view
     * @param {RaftManager} raftManager - Reference to the raft manager
     */
    constructor(container, raftManager) {
        this.container = container;
        this.raftManager = raftManager;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.animationFrameId = null;
        this.lastRenderTime = 0;
        
        // Raft rendering properties
        this.tileSize = 50; // Size of each raft tile in pixels
        this.raftColor = '#8B4513'; // Brown color for raft
        this.gridLineColor = '#6B3500'; // Darker brown for grid lines
        this.waterColor = '#0a1a2a'; // Dark blue for water
        this.waterRippleTime = 0; // Time counter for water animation
        
        // Bind methods
        this.render = this.render.bind(this);
        this.handleResize = this.handleResize.bind(this);
        
        // Add event listeners
        window.addEventListener('resize', this.handleResize);
    }
    
    /**
     * Initialize the raft view
     */
    init() {
        // Set canvas size
        this.resizeCanvas();
        
        // Start rendering
        this.startRendering();
    }
    
    /**
     * Start the rendering loop
     */
    startRendering() {
        if (this.animationFrameId) return;
        
        this.lastRenderTime = performance.now();
        this.animationFrameId = requestAnimationFrame(this.render);
    }
    
    /**
     * Stop the rendering loop
     */
    stopRendering() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }
    
    /**
     * Render the raft view
     * @param {number} timestamp - Current timestamp
     */
    render(timestamp) {
        const deltaTime = timestamp - this.lastRenderTime;
        this.lastRenderTime = timestamp;
        
        // Update water animation time
        this.waterRippleTime += deltaTime * 0.001; // Convert to seconds
        
        // Clear the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw water background
        this.drawWater();
        
        // Draw the raft
        this.drawRaft();
        
        // Request next frame
        this.animationFrameId = requestAnimationFrame(this.render);
    }
    
    /**
     * Draw the water background
     */
    drawWater() {
        const { width, height } = this.canvas;
        
        // Fill with base water color
        this.ctx.fillStyle = this.waterColor;
        this.ctx.fillRect(0, 0, width, height);
        
        // Draw water ripples
        this.ctx.save();
        
        // Create a subtle wave pattern
        for (let i = 0; i < 5; i++) {
            const rippleSize = 20 + i * 30;
            const speed = 0.2 + i * 0.1;
            const opacity = 0.05 - i * 0.01;
            
            this.ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})`;
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            
            for (let x = 0; x < width; x += 20) {
                const y = Math.sin((x * 0.01) + (this.waterRippleTime * speed)) * rippleSize;
                
                if (x === 0) {
                    this.ctx.moveTo(x, height / 2 + y);
                } else {
                    this.ctx.lineTo(x, height / 2 + y);
                }
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw the raft
     */
    drawRaft() {
        const raftSize = this.raftManager.getSize();
        const grid = this.raftManager.grid;
        
        // Calculate the center position for the raft
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Calculate the total raft width and height
        const totalWidth = raftSize * this.tileSize;
        const totalHeight = raftSize * this.tileSize;
        
        // Calculate the top-left corner of the raft
        const raftX = centerX - totalWidth / 2;
        const raftY = centerY - totalHeight / 2;
        
        // Add a gentle floating animation
        const floatOffset = Math.sin(this.waterRippleTime * 0.5) * 5;
        
        // Draw each tile of the raft
        for (let y = 0; y < raftSize; y++) {
            for (let x = 0; x < raftSize; x++) {
                const tileX = raftX + x * this.tileSize;
                const tileY = raftY + y * this.tileSize + floatOffset;
                
                // Draw the tile
                this.ctx.fillStyle = this.raftColor;
                this.ctx.fillRect(tileX, tileY, this.tileSize, this.tileSize);
                
                // Draw grid lines
                this.ctx.strokeStyle = this.gridLineColor;
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(tileX, tileY, this.tileSize, this.tileSize);
                
                // Draw wood grain texture
                this.drawWoodGrain(tileX, tileY);
                
                // If there's a structure on this tile, draw it
                if (grid[y][x].structureId) {
                    // Future: Draw structures here
                }
            }
        }
    }
    
    /**
     * Draw wood grain texture on a tile
     * @param {number} x - X coordinate of the tile
     * @param {number} y - Y coordinate of the tile
     */
    drawWoodGrain(x, y) {
        this.ctx.save();
        
        // Draw some lines to simulate wood grain
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1;
        
        // Create a semi-random pattern based on position
        const seed = (x * 0.1) + (y * 0.3);
        const lineCount = 3 + Math.floor(Math.sin(seed) * 2);
        
        for (let i = 0; i < lineCount; i++) {
            const lineY = y + (i + 1) * (this.tileSize / (lineCount + 1));
            const waveAmplitude = 2 + Math.sin(seed + i) * 2;
            
            this.ctx.beginPath();
            this.ctx.moveTo(x, lineY);
            
            // Create a wavy line
            for (let lineX = 0; lineX <= this.tileSize; lineX += 5) {
                const waveY = lineY + Math.sin(lineX * 0.1 + seed + i) * waveAmplitude;
                this.ctx.lineTo(x + lineX, waveY);
            }
            
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    /**
     * Resize the canvas to fit the container
     */
    resizeCanvas() {
        // Get the container dimensions
        const containerWidth = this.container.clientWidth;
        const containerHeight = this.container.clientHeight;
        
        // Set canvas size
        this.canvas.width = containerWidth;
        this.canvas.height = containerHeight;
        
        // Adjust tile size based on raft size and canvas dimensions
        const raftSize = this.raftManager.getSize();
        const maxTileSize = Math.min(
            containerWidth / (raftSize + 2), // Add padding
            containerHeight / (raftSize + 2)
        );
        
        this.tileSize = Math.min(maxTileSize, 80); // Cap at 80px
    }
    
    /**
     * Handle window resize event
     */
    handleResize() {
        this.resizeCanvas();
    }
    
    /**
     * Update the raft view
     */
    update() {
        console.log(`Updating raft view, raft size: ${this.raftManager.getSize()}`);
        // Resize canvas in case raft size changed
        this.resizeCanvas();
    }
    
    /**
     * Clean up the raft view
     */
    cleanup() {
        this.stopRendering();
        window.removeEventListener('resize', this.handleResize);
    }
}
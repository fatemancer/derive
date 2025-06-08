/**
 * Math Utility Functions
 * Contains helper functions for mathematical operations
 */

const MathUtils = {
    /**
     * Clamps a value between min and max
     * @param {number} value - The value to clamp
     * @param {number} min - The minimum value
     * @param {number} max - The maximum value
     * @returns {number} - The clamped value
     */
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    /**
     * Linear interpolation between two values
     * @param {number} a - Start value
     * @param {number} b - End value
     * @param {number} t - Interpolation factor (0-1)
     * @returns {number} - The interpolated value
     */
    lerp: function(a, b, t) {
        return a + (b - a) * this.clamp(t, 0, 1);
    },
    
    /**
     * Converts a value from one range to another
     * @param {number} value - The value to convert
     * @param {number} oldMin - Old range minimum
     * @param {number} oldMax - Old range maximum
     * @param {number} newMin - New range minimum
     * @param {number} newMax - New range maximum
     * @returns {number} - The converted value
     */
    map: function(value, oldMin, oldMax, newMin, newMax) {
        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        return (((value - oldMin) * newRange) / oldRange) + newMin;
    },
    
    /**
     * Calculates the distance between two points
     * @param {number} x1 - X coordinate of first point
     * @param {number} y1 - Y coordinate of first point
     * @param {number} x2 - X coordinate of second point
     * @param {number} y2 - Y coordinate of second point
     * @returns {number} - The distance between the points
     */
    distance: function(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    /**
     * Formats a number with commas for thousands
     * @param {number} num - The number to format
     * @returns {string} - The formatted number
     */
    formatNumber: function(num) {
        return num.toLocaleString('en-US');
    }
};
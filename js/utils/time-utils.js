/**
 * Time Utility Functions
 * Contains helper functions for time-related operations
 */

const TimeUtils = {
    /**
     * Gets the current timestamp in milliseconds
     * @returns {number} - Current timestamp
     */
    getCurrentTime: function() {
        return Date.now();
    },
    
    /**
     * Formats milliseconds into a human-readable time string
     * @param {number} ms - Time in milliseconds
     * @returns {string} - Formatted time string (e.g., "2h 30m 15s")
     */
    formatTime: function(ms) {
        if (ms <= 0) return '0s';
        
        const seconds = Math.floor((ms / 1000) % 60);
        const minutes = Math.floor((ms / (1000 * 60)) % 60);
        const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        
        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        if (seconds > 0) result += `${seconds}s`;
        
        return result.trim();
    },
    
    /**
     * Calculates time difference between now and a past timestamp
     * @param {number} pastTime - Past timestamp in milliseconds
     * @returns {number} - Time difference in milliseconds
     */
    getTimeDifference: function(pastTime) {
        return this.getCurrentTime() - pastTime;
    },
    
    /**
     * Checks if a cooldown has expired
     * @param {number} startTime - Start timestamp in milliseconds
     * @param {number} cooldownDuration - Cooldown duration in milliseconds
     * @returns {boolean} - True if cooldown has expired
     */
    isCooldownExpired: function(startTime, cooldownDuration) {
        return this.getTimeDifference(startTime) >= cooldownDuration;
    },
    
    /**
     * Gets remaining cooldown time
     * @param {number} startTime - Start timestamp in milliseconds
     * @param {number} cooldownDuration - Cooldown duration in milliseconds
     * @returns {number} - Remaining cooldown time in milliseconds
     */
    getRemainingCooldown: function(startTime, cooldownDuration) {
        const elapsed = this.getTimeDifference(startTime);
        return Math.max(0, cooldownDuration - elapsed);
    },
    
    /**
     * Creates a debounced function that delays invoking func until after wait milliseconds
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    debounce: function(func, wait) {
        let timeout;
        return function(...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    }
};
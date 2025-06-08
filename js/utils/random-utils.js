/**
 * Random Utility Functions
 * Contains helper functions for randomization
 */

const RandomUtils = {
    /**
     * Returns a random integer between min and max (inclusive)
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random integer between min and max
     */
    getRandomInt: function(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    /**
     * Returns a random float between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @returns {number} - Random float between min and max
     */
    getRandomFloat: function(min, max) {
        return Math.random() * (max - min) + min;
    },
    
    /**
     * Returns true with the given probability
     * @param {number} probability - Probability between 0 and 1
     * @returns {boolean} - True or false based on probability
     */
    chance: function(probability) {
        return Math.random() < probability;
    },
    
    /**
     * Returns a random element from an array
     * @param {Array} array - The array to pick from
     * @returns {*} - Random element from the array
     */
    getRandomElement: function(array) {
        if (!array || array.length === 0) return null;
        return array[Math.floor(Math.random() * array.length)];
    },
    
    /**
     * Shuffles an array in place using Fisher-Yates algorithm
     * @param {Array} array - The array to shuffle
     * @returns {Array} - The shuffled array
     */
    shuffleArray: function(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    },
    
    /**
     * Generates a random color in hex format
     * @returns {string} - Random color in hex format
     */
    getRandomColor: function() {
        return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    }
};
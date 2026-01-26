/**
 * storage.js
 * Handles all localStorage interactions.
 */

const Storage = {
    /**
     * Retrieves data from localStorage.
     * @param {string} key - The key to retrieve.
     * @returns {any} - The parsed data or null if not found.
     */
    getData: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },

    /**
     * Saves data to localStorage.
     * @param {string} key - The key to save to.
     * @param {any} value - The data to save.
     */
    setData: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    },

    /**
     * Generates a unique ID with a prefix.
     * @param {string} prefix - The prefix for the ID (e.g., 'srv', 'ogr').
     * @returns {string} - The generated ID.
     */
    generateId: (prefix) => {
        return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    }
};

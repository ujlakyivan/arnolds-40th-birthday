/**
 * Utility functions for Arnold's Birthday Games
 */

// UI helper functions
const UIUtils = {
    /**
     * Shows an element by removing 'hidden' class and adding 'active' class
     * @param {HTMLElement} element - The element to show
     */
    showElement: function(element) {
        if (!element) return;
        element.classList.remove('hidden');
        element.classList.add('active');
    },
    
    /**
     * Hides an element by removing 'active' class and adding 'hidden' class
     * @param {HTMLElement} element - The element to hide
     */
    hideElement: function(element) {
        if (!element) return;
        element.classList.remove('active');
        element.classList.add('hidden');
    },
    
    /**
     * Creates and shows a notification message
     * @param {string} message - The message to display
     * @param {string} type - The message type ('error', 'success', 'info')
     * @param {number} duration - How long to show the message in ms (0 for permanent)
     */
    showNotification: function(message, type = 'info', duration = 3000) {
        // Remove existing notification if present
        this.removeNotification();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'notification';
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '15px';
        notification.style.borderRadius = '5px';
        notification.style.zIndex = '1000';
        
        // Set background color based on type
        if (type === 'error') {
            notification.style.backgroundColor = '#e74c3c';
        } else if (type === 'success') {
            notification.style.backgroundColor = '#2ecc71';
        } else {
            notification.style.backgroundColor = '#3498db';
        }
        
        notification.style.color = 'white';
        notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Auto-remove after duration if not 0
        if (duration > 0) {
            setTimeout(() => this.removeNotification(), duration);
        }
    },
    
    /**
     * Removes the notification element if it exists
     */
    removeNotification: function() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.remove();
        }
    },
    
    /**
     * Check device orientation and display warning for landscape mode on mobile
     */
    checkOrientation: function() {
        const isMobile = window.matchMedia("(max-width: 1024px)").matches;
        const isLandscape = window.innerWidth > window.innerHeight;
        const messageEl = document.getElementById('orientation-message');
        
        if (isLandscape && isMobile) {
            // Create message if it doesn't exist
            if (!messageEl) {
                const message = document.createElement('div');
                message.id = 'orientation-message';
                message.style.position = 'fixed';
                message.style.top = '0';
                message.style.left = '0';
                message.style.width = '100%';
                message.style.padding = '10px';
                message.style.backgroundColor = '#ff9800';
                message.style.color = 'white';
                message.style.textAlign = 'center';
                message.style.zIndex = '1000';
                message.textContent = 'For the best experience, please rotate your device to portrait mode.';
                document.body.appendChild(message);
            }
        } else if (messageEl) {
            messageEl.remove();
        }
    }
};

// Storage helper functions
const StorageUtils = {
    /**
     * Saves data to localStorage with error handling
     * @param {string} key - The key to use for storage
     * @param {any} value - The value to store
     * @returns {boolean} Success status
     */
    saveToStorage: function(key, value) {
        try {
            const serialized = JSON.stringify(value);
            localStorage.setItem(key, serialized);
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },
    
    /**
     * Retrieves and parses data from localStorage
     * @param {string} key - The key to retrieve
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} The stored value or defaultValue
     */
    getFromStorage: function(key, defaultValue = null) {
        try {
            const value = localStorage.getItem(key);
            if (value === null) {
                return defaultValue;
            }
            return JSON.parse(value);
        } catch (e) {
            console.error('Error getting from localStorage:', e);
            return defaultValue;
        }
    },
    
    /**
     * Removes a key from localStorage
     * @param {string} key - The key to remove
     */
    removeFromStorage: function(key) {
        try {
            localStorage.removeItem(key);
        } catch (e) {
            console.error('Error removing from localStorage:', e);
        }
    }
};

// Path and URL helper functions
const PathUtils = {
    /**
     * Gets the base URL from base href tag
     * @returns {string} The base URL path
     */
    getBasePath: function() {
        const baseElement = document.querySelector('base');
        return baseElement ? baseElement.getAttribute('href') || '' : '';
    },
    
    /**
     * Combines base path with a relative path
     * @param {string} path - The relative path
     * @returns {string} The combined path
     */
    combinePath: function(path) {
        const basePath = this.getBasePath();
        
        if (!path) return basePath;
        
        if (path.startsWith('/')) {
            return basePath + path.substring(1);
        } else {
            return basePath + path;
        }
    }
};

// Export the utils for use in other files
window.UIUtils = UIUtils;
window.StorageUtils = StorageUtils;
window.PathUtils = PathUtils;
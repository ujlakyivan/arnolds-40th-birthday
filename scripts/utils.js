/**
 * Utility functions for Arnold's Birthday Games
 */

// UI helper functions
const UIUtils = {
    /**
     * Shows a notification message to the user
     * @param {string} message - The message to display
     * @param {string} type - The type of message (success, error, info, warning)
     * @param {number} duration - Time in ms to show the notification
     */
    showNotification: function(message, type = 'info', duration = 3000) {
        // Remove existing notifications
        this.removeNotifications();
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Apply styles
        notification.style.position = 'fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '4px';
        notification.style.zIndex = '1000';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        notification.style.transition = 'all 0.3s ease-in-out';
        
        // Set color based on type
        const colors = {
            success: { bg: '#2ecc71', text: '#fff' },
            error: { bg: '#e74c3c', text: '#fff' },
            info: { bg: '#3498db', text: '#fff' },
            warning: { bg: '#f39c12', text: '#fff' }
        };
        
        const color = colors[type] || colors.info;
        
        notification.style.backgroundColor = color.bg;
        notification.style.color = color.text;
        notification.style.boxShadow = '0 3px 6px rgba(0,0,0,0.16)';
        
        // Add to DOM
        document.body.appendChild(notification);
        
        // Display animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);
        
        // Remove after duration
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            
            setTimeout(() => {
                notification.remove(); // Use .remove() instead of removeChild
            }, 300);
        }, duration);
    },
    
    /**
     * Removes all notifications from the page
     */
    removeNotifications: function() {
        const notifications = document.querySelectorAll('.notification');
        notifications.forEach(notification => {
            notification.remove();
        });
    },
    
    /**
     * Shows an element by removing the 'hidden' class
     * @param {Element} element - The element to show
     */
    showElement: function(element) {
        if (element) element.classList.remove('hidden');
    },
    
    /**
     * Hides an element by adding the 'hidden' class
     * @param {Element} element - The element to hide
     */
    hideElement: function(element) {
        if (element) element.classList.add('hidden');
    },
    
    /**
     * Checks if the device is in portrait orientation and shows a message if needed
     */
    checkOrientation: function() {
        const messageEl = document.getElementById('orientation-message');
        
        if (window.innerHeight > window.innerWidth) {
            // Portrait mode - check if message exists
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

// Game completion tracking functions
const GameCompletionUtils = {
    /**
     * Gets the current user's completion status for all games
     * @returns {Object} Object with game IDs as keys and completion status as values
     */
    getCompletedGames: async function() {
        const authInfo = StorageUtils.getFromStorage('authInfo', null);
        if (!authInfo || !authInfo.username) {
            return {}; // No user logged in
        }
        
        // Use Firebase GameCompletionService if available
        if (window.GameCompletionService && typeof window.GameCompletionService.getUserCompletions === 'function') {
            try {
                return await window.GameCompletionService.getUserCompletions(authInfo.username);
            } catch (err) {
                console.error('Error getting completions from Firebase:', err);
                // Fall back to local storage only if Firebase fails
                const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
                return allCompletionData[authInfo.username] || {};
            }
        } else {
            // Fall back to local storage if Firebase service not available
            const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
            return allCompletionData[authInfo.username] || {};
        }
    },
    
    /**
     * Marks a game as completed for the current user
     * @param {number} gameId - The ID of the completed game
     * @param {boolean} completed - Whether the game is completed (default: true)
     * @returns {boolean} Success status
     */
    markGameCompleted: function(gameId, completed = true) {
        const authInfo = StorageUtils.getFromStorage('authInfo', null);
        if (!authInfo || !authInfo.username) {
            return false; // No user logged in
        }
        
        // Use Firebase if available
        if (window.GameCompletionService && typeof window.GameCompletionService.markGameCompleted === 'function' && completed) {
            // For Firebase, we'll handle this asynchronously
            window.GameCompletionService.markGameCompleted(authInfo.username, gameId)
                .catch(err => {
                    console.error('Error marking game completed in Firebase:', err);
                });
        }
        
        // Always update local storage for backwards compatibility
        const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
        
        // Get user's completion data or create if not exists
        if (!allCompletionData[authInfo.username]) {
            allCompletionData[authInfo.username] = {};
        }
        
        // Update the completion status
        allCompletionData[authInfo.username][gameId] = completed;
        
        // Save back to storage
        return StorageUtils.saveToStorage('gameCompletions', allCompletionData);
    },
    
    /**
     * Checks if a specific game is completed by the current user
     * @param {number} gameId - The ID of the game to check
     * @returns {boolean} Whether the game is completed
     */
    isGameCompleted: function(gameId) {
        const authInfo = StorageUtils.getFromStorage('authInfo', null);
        if (!authInfo || !authInfo.username) {
            return false; // No user logged in
        }
        
        // Get initial completion status from local storage
        const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
        const localCompletion = allCompletionData[authInfo.username] && allCompletionData[authInfo.username][gameId];
        
        // If Firebase service is available, check there and update local storage
        if (window.GameCompletionService && typeof window.GameCompletionService.getUserCompletions === 'function') {
            // Get completion status from Firebase
            window.GameCompletionService.getUserCompletions(authInfo.username)
                .then(completions => {
                    const firebaseIsCompleted = !!completions[gameId];
                    
                    // If Firebase and local storage disagree, update local storage to match Firebase
                    if (firebaseIsCompleted !== !!localCompletion) {
                        console.log(`Game ${gameId} completion status: Firebase=${firebaseIsCompleted}, Local=${!!localCompletion}. Updating local storage.`);
                        
                        // Update local storage with Firebase data (the source of truth)
                        if (!allCompletionData[authInfo.username]) {
                            allCompletionData[authInfo.username] = {};
                        }
                        allCompletionData[authInfo.username][gameId] = firebaseIsCompleted;
                        StorageUtils.saveToStorage('gameCompletions', allCompletionData);
                        
                        // Refresh the UI
                        if (window.gamesInstance && typeof window.gamesInstance.refreshGameTiles === 'function') {
                            console.log('Refreshing game tiles after completion status update');
                            window.gamesInstance.refreshGameTiles();
                        }
                    }
                })
                .catch(err => {
                    console.error('Error checking game completion status:', err);
                });
        }
        
        // Return local completion status (will be updated asynchronously if needed)
        return !!localCompletion;
    },
    
    /**
     * Check if all games are completed by the current user
     * @param {Array} gameIds - Array of all game IDs to check
     * @returns {boolean} Whether all games are completed
     */
    areAllGamesCompleted: function(gameIds) {
        // This uses the local storage data initially, but will be updated
        // when Firebase data is retrieved via isGameCompleted
        const completedGames = {};
        
        // Check each game individually to trigger Firebase checks
        gameIds.forEach(id => {
            completedGames[id] = this.isGameCompleted(id);
        });
        
        return gameIds.every(id => completedGames[id]);
    },
    
    /**
     * Resets completion status for all games for a specific user or all users
     * @param {string} username - Username to reset (null for all users)
     * @returns {boolean} Success status
     */
    resetCompletionStatus: function(username = null) {
        if (username) {
            // Reset for a specific user
            const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
            if (allCompletionData[username]) {
                allCompletionData[username] = {};
                return StorageUtils.saveToStorage('gameCompletions', allCompletionData);
            }
            return true;
        } else {
            // Reset for all users
            return StorageUtils.saveToStorage('gameCompletions', {});
        }
    },
    
    /**
     * Reset completion status of a specific game for a user
     * @param {string} username - The username to reset the game for
     * @param {number} gameId - The ID of the game to reset
     * @returns {boolean} Success status
     */
    resetGameCompletion: function(username, gameId) {
        // Use Firebase if available
        if (window.GameCompletionService && typeof window.GameCompletionService.resetGameCompletion === 'function') {
            // Reset in Firebase (async)
            window.GameCompletionService.resetGameCompletion(username, gameId)
                .catch(err => {
                    console.error('Error resetting game completion in Firebase:', err);
                });
        }
        
        // Always update local storage as well
        const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
        
        // Check if user exists in the data
        if (!allCompletionData[username]) {
            return true; // User not found, but we've tried Firebase so return true
        }
        
        // Remove the game from completion data
        if (allCompletionData[username][gameId]) {
            delete allCompletionData[username][gameId];
            
            // Save back to storage
            return StorageUtils.saveToStorage('gameCompletions', allCompletionData);
        }
        
        return true; // The game may have been reset in Firebase even if not in local storage
    },
    
    /**
     * Reset all game completions for a specific user
     * @param {string} username - The username to reset all games for
     * @returns {boolean} Success status
     */
    resetAllGameCompletions: function(username) {
        // Use Firebase if available
        if (window.GameCompletionService && typeof window.GameCompletionService.resetAllCompletions === 'function') {
            // Reset in Firebase (async)
            window.GameCompletionService.resetAllCompletions(username)
                .catch(err => {
                    console.error('Error resetting all game completions in Firebase:', err);
                });
        }
        
        // Always update local storage as well
        const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
        
        // Check if user exists in the data
        if (!allCompletionData[username]) {
            return true; // User not found, but we've tried Firebase so return true
        }
        
        // Reset the user's completion data
        allCompletionData[username] = {};
        
        // Save back to storage
        return StorageUtils.saveToStorage('gameCompletions', allCompletionData);
    },
    
    /**
     * Get all users with their completed games
     * @returns {Object} Object with usernames as keys and completion data as values
     */
    getAllUsersCompletions: function() {
        return StorageUtils.getFromStorage('gameCompletions', {});
    }
};

// Export the utils for use in other files
window.UIUtils = UIUtils;
window.StorageUtils = StorageUtils;
window.PathUtils = PathUtils;
window.GameCompletionUtils = GameCompletionUtils;
class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.authToken = null;
        this.currentUser = null;
        this.apiBaseUrl = 'http://localhost:3000/api'; // API base URL - change in production
        
        // Fallback credentials for offline mode
        this.credentials = {
            'muradin': { password: 'gfy', role: 'user' },
            'admin': { password: 'admin40', role: 'admin' }
        };
        
        // Cache DOM elements
        this.elements = {
            loginButton: document.getElementById('login-button'),
            logoutButton: document.getElementById('logout-button'),
            authError: document.getElementById('auth-error'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            authContainer: document.getElementById('auth-container'),
            gamesContainer: document.getElementById('games-container'),
            adminControls: document.getElementById('admin-controls') // May not exist yet
        };
        
        this.bindEvents();
        this.checkAuthStatus();
    }
    
    bindEvents() {
        this.elements.loginButton.addEventListener('click', () => this.login());
        this.elements.logoutButton.addEventListener('click', () => this.logout());
        
        // Add keyboard event for login form
        this.elements.password.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.login();
            }
        });
    }
    
    async login() {
        const username = this.elements.username.value.trim();
        const password = this.elements.password.value;
        
        // Validate inputs
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }
        
        try {
            // Try server login first
            const response = await this.serverLogin(username, password);
            if (response.success) {
                this.authToken = response.token;
                this.isAuthenticated = true;
                this.isAdmin = response.user.role === 'admin';
                this.currentUser = username;
                
                // Store auth info
                const authInfo = {
                    token: this.authToken,
                    role: response.user.role,
                    username: username
                };
                
                StorageUtils.saveToStorage('authInfo', authInfo);
                
                this.showGamesContainer();
                this.clearError();
                this.clearInputs();
                
                // Show admin controls if admin user
                this.updateUIForRole();
                
                // Success notification
                UIUtils.showNotification(`Welcome back, ${username}!`, 'success');
                return;
            } 
        } catch (error) {
            console.log('Server login failed, trying client-side fallback');
            
            // If server login fails or not available, try client-side fallback
            const userInfo = this.credentials[username];
            if (userInfo && userInfo.password === password) {
                this.authenticateUser(username, password, userInfo.role);
                return;
            }
        }
        
        this.showError('Invalid username or password');
    }
    
    async serverLogin(username, password) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Server login error:', error);
            throw error;
        }
    }
    
    authenticateUser(username, password, role) {
        this.isAuthenticated = true;
        this.isAdmin = role === 'admin';
        this.currentUser = username;
        
        // Store auth info with role for offline mode
        const authInfo = {
            token: btoa(`${username}:${password}`),
            role: role,
            username: username
        };
        
        this.authToken = authInfo.token;
        
        // Use StorageUtils instead of direct localStorage calls
        StorageUtils.saveToStorage('authInfo', authInfo);
        
        this.showGamesContainer();
        this.clearError();
        this.clearInputs();
        
        // Show admin controls if admin user
        this.updateUIForRole();
        
        UIUtils.showNotification(`Welcome back, ${username}!`, 'success');
    }
    
    updateUIForRole() {
        if (this.isAdmin) {
            // Create admin controls if they don't exist
            this.createAdminControls();
        } else {
            // Hide admin controls if they exist
            this.hideAdminControls();
        }
    }
    
    /**
     * Create admin controls in the header
     */
    createAdminControls() {
        // Check if admin controls already exist
        if (document.querySelector('.admin-controls')) {
            return;
        }
        
        // Create admin controls container
        const adminControls = document.createElement('div');
        adminControls.className = 'admin-controls';
        
        // Add admin buttons
        adminControls.innerHTML = `
            <button id="user-management" class="admin-button">User Management</button>
            <button id="game-completions" class="admin-button">Game Completions</button>
            <button id="site-settings" class="admin-button">Site Settings</button>
        `;
        
        // Add styles
        adminControls.style.marginTop = '10px';
        adminControls.style.display = 'flex';
        adminControls.style.gap = '10px';
        
        const buttons = adminControls.querySelectorAll('button');
        buttons.forEach(button => {
            button.style.padding = '8px 15px';
            button.style.backgroundColor = '#007bff';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
            button.style.fontSize = '14px';
            
            // Hover effect
            button.addEventListener('mouseover', () => {
                button.style.backgroundColor = '#0069d9';
            });
            
            button.addEventListener('mouseout', () => {
                button.style.backgroundColor = '#007bff';
            });
        });
        
        // Insert after logout button in the games header instead of auth container
        const gamesHeader = document.querySelector('.birthday-header');
        if (gamesHeader) {
            gamesHeader.appendChild(adminControls);
        } else {
            console.error('Could not find games header to append admin controls');
        }
        
        // Add event listeners
        document.getElementById('user-management').addEventListener('click', () => {
            this.openUserManagement();
        });
        
        document.getElementById('game-completions').addEventListener('click', () => {
            this.openGameCompletions();
        });
        
        document.getElementById('site-settings').addEventListener('click', () => {
            this.openSiteSettings();
        });
    }
    
    /**
     * Hide admin controls
     */
    hideAdminControls() {
        const adminControls = document.querySelector('.admin-controls');
        if (adminControls) {
            adminControls.remove();
        }
    }
    
    /**
     * Opens the game completion management modal
     */
    async openGameCompletions() {
        // Create modal for game completion management
        const modal = this.createModal('Game Completions Management');
        
        // Get all users and their completion status
        const allCompletions = window.GameCompletionUtils.getAllUsersCompletions();
        
        // Get game data
        const gamesInstance = window.gamesInstance || new Games();
        const gamesList = gamesInstance.games;
        
        // Create modal content
        const content = document.createElement('div');
        
        let contentHTML = `
            <div class="game-completion-management">
                <p class="completion-intro">Manage which games users have completed. These are automatically marked when users achieve a 90% or higher score.</p>
                
                <div class="users-completion-list">
        `;
        
        // Generate user completion sections
        Object.keys(allCompletions).forEach(username => {
            const userCompletions = allCompletions[username];
            const completedCount = Object.keys(userCompletions).length;
            
            contentHTML += `
                <div class="user-completion-section">
                    <h4 class="user-completion-title">${username}</h4>
                    <p class="user-completion-count">Completed ${completedCount} game(s)</p>
                    
                    <div class="user-games-list">
            `;
            
            // Add all games with their completion status
            gamesList.forEach(game => {
                const isCompleted = userCompletions[game.id] === true;
                
                contentHTML += `
                    <div class="game-completion-item">
                        <span class="game-completion-name">
                            <span class="game-emoji">${game.emoji}</span> ${game.title}
                        </span>
                        <div class="game-completion-actions">
                            <span class="game-completion-status ${isCompleted ? 'completed' : 'not-completed'}">
                                ${isCompleted ? '✓ Completed' : '✗ Not Completed'}
                            </span>
                            ${isCompleted ? 
                                `<button class="reset-game-completion" data-username="${username}" data-game-id="${game.id}">Reset</button>` : 
                                `<button class="mark-game-completed" data-username="${username}" data-game-id="${game.id}">Mark Completed</button>`
                            }
                        </div>
                    </div>
                `;
            });
            
            // Add reset all button for this user
            contentHTML += `
                    </div>
                    <button class="reset-all-completions" data-username="${username}">Reset All for ${username}</button>
                </div>
            `;
        });
        
        // Close the outer divs
        contentHTML += `
                </div>
            </div>
        `;
        
        // Set the content HTML
        content.innerHTML = contentHTML;
        
        // Style the content
        this.applyCompletionManagementStyles(content);
        
        // Add content to modal
        modal.querySelector('.modal-content').appendChild(content);
        
        // Add event listeners for buttons
        const resetButtons = modal.querySelectorAll('.reset-game-completion');
        resetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-username');
                const gameId = parseInt(button.getAttribute('data-game-id'));
                
                if (window.GameCompletionUtils.resetGameCompletion(username, gameId)) {
                    UIUtils.showNotification(`Reset completion of game #${gameId} for ${username}`, 'success');
                    
                    // Refresh the modal
                    this.closeModal();
                    this.openGameCompletions();
                    
                    // If on the games page, refresh the games grid
                    if (window.gamesInstance) {
                        window.gamesInstance.loadGames();
                    }
                }
            });
        });
        
        const markCompletedButtons = modal.querySelectorAll('.mark-game-completed');
        markCompletedButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-username');
                const gameId = parseInt(button.getAttribute('data-game-id'));
                
                // Get all completions
                const allCompletionData = StorageUtils.getFromStorage('gameCompletions', {});
                
                // Get user's completion data or create if not exists
                if (!allCompletionData[username]) {
                    allCompletionData[username] = {};
                }
                
                // Mark as completed
                allCompletionData[username][gameId] = true;
                
                // Save back to storage
                if (StorageUtils.saveToStorage('gameCompletions', allCompletionData)) {
                    UIUtils.showNotification(`Marked game #${gameId} as completed for ${username}`, 'success');
                    
                    // Refresh the modal
                    this.closeModal();
                    this.openGameCompletions();
                    
                    // If on the games page, refresh the games grid
                    if (window.gamesInstance) {
                        window.gamesInstance.loadGames();
                    }
                }
            });
        });
        
        const resetAllButtons = modal.querySelectorAll('.reset-all-completions');
        resetAllButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-username');
                
                if (confirm(`Are you sure you want to reset ALL game completions for ${username}?`)) {
                    if (window.GameCompletionUtils.resetAllGameCompletions(username)) {
                        UIUtils.showNotification(`Reset all game completions for ${username}`, 'success');
                        
                        // Refresh the modal
                        this.closeModal();
                        this.openGameCompletions();
                        
                        // If on the games page, refresh the games grid
                        if (window.gamesInstance) {
                            window.gamesInstance.loadGames();
                        }
                    }
                }
            });
        });
    }
    
    /**
     * Apply styles to completion management
     * @param {Element} container - The container element to style
     */
    applyCompletionManagementStyles(container) {
        // Add styles to completion management
        const style = document.createElement('style');
        style.textContent = `
            .game-completion-management {
                padding: 10px;
                max-height: 70vh;
                overflow-y: auto;
            }
            .completion-intro {
                margin-bottom: 15px;
                color: #555;
                font-style: italic;
            }
            .users-completion-list {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            .user-completion-section {
                border: 1px solid #e1e1e1;
                border-radius: 6px;
                padding: 15px;
                background-color: #f9f9f9;
            }
            .user-completion-title {
                margin: 0;
                font-size: 1.2rem;
                color: #333;
            }
            .user-completion-count {
                margin: 5px 0 10px;
                color: #666;
                font-size: 0.9rem;
            }
            .user-games-list {
                display: flex;
                flex-direction: column;
                gap: 10px;
                margin-bottom: 15px;
            }
            .game-completion-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 12px;
                background-color: white;
                border-radius: 4px;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            .game-completion-name {
                display: flex;
                align-items: center;
                gap: 8px;
            }
            .game-emoji {
                font-size: 1.4rem;
            }
            .game-completion-actions {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            .game-completion-status {
                padding: 3px 8px;
                border-radius: 12px;
                font-size: 0.85rem;
            }
            .game-completion-status.completed {
                background-color: #e8f5e9;
                color: #2e7d32;
            }
            .game-completion-status.not-completed {
                background-color: #ffebee;
                color: #c62828;
            }
            button.reset-game-completion, 
            button.mark-game-completed {
                padding: 5px 10px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
            }
            button.reset-game-completion {
                background-color: #ffebee;
                color: #c62828;
            }
            button.mark-game-completed {
                background-color: #e8f5e9;
                color: #2e7d32;
            }
            button.reset-all-completions {
                background-color: #e53935;
                color: white;
                border: none;
                padding: 8px 15px;
                border-radius: 4px;
                cursor: pointer;
                align-self: flex-start;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }
    
    async openUserManagement() {
        // Create a modal for user management
        const modal = this.createModal('User Management');
        
        try {
            // Try to get users from server API
            const users = await this.getUsers();
            
            // Create user management content
            const content = document.createElement('div');
            content.innerHTML = `
                <div class="user-list">
                    <h4>Current Users</h4>
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="user-table-body">
                            ${users.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>${user.role}</td>
                                    <td>
                                        <button class="edit-user" data-id="${user.id}" data-username="${user.username}">Edit</button>
                                        <button class="delete-user" data-id="${user.id}" data-username="${user.username}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                <div class="add-user-form">
                    <h4>Add New User</h4>
                    <div class="form-group">
                        <label for="new-username">Username:</label>
                        <input type="text" id="new-username" placeholder="Enter username">
                    </div>
                    <div class="form-group">
                        <label for="new-password">Password:</label>
                        <input type="password" id="new-password" placeholder="Enter password">
                    </div>
                    <div class="form-group">
                        <label for="new-role">Role:</label>
                        <select id="new-role">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button id="add-user-btn">Add User</button>
                </div>
            `;
            
            // Add content to modal
            modal.querySelector('.modal-content').appendChild(content);
            
            // Add event listeners for user actions
            modal.querySelector('#add-user-btn').addEventListener('click', () => {
                const newUsername = document.getElementById('new-username').value;
                const newPassword = document.getElementById('new-password').value;
                const newRole = document.getElementById('new-role').value;
                
                if (newUsername && newPassword) {
                    this.createUser(newUsername, newPassword, newRole);
                } else {
                    UIUtils.showNotification('Username and password are required', 'error');
                }
            });
            
            // Add event listeners for edit and delete buttons
            const editButtons = modal.querySelectorAll('.edit-user');
            editButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const userId = button.getAttribute('data-id');
                    const username = button.getAttribute('data-username');
                    this.editUser(userId, username);
                });
            });
            
            const deleteButtons = modal.querySelectorAll('.delete-user');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const userId = button.getAttribute('data-id');
                    const username = button.getAttribute('data-username');
                    this.deleteUser(userId, username);
                });
            });
        } catch (error) {
            console.error('Error getting users:', error);
            
            // Fallback to local storage if server API fails
            this.openUserManagementFallback(modal);
        }
    }
    
    async getUsers() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get users');
            }
            
            const data = await response.json();
            return data.users || [];
        } catch (error) {
            console.error('Error getting users:', error);
            throw error;
        }
    }
    
    async createUser(username, password, role) {
        try {
            const response = await fetch(`${this.apiBaseUrl}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({ username, password, role })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh the modal
                this.closeModal();
                this.openUserManagement();
                
                // Show success notification
                UIUtils.showNotification(`User ${username} added successfully!`, 'success');
            } else {
                UIUtils.showNotification(data.message || 'Error adding user', 'error');
            }
        } catch (error) {
            console.error('Error creating user:', error);
            UIUtils.showNotification('Server error. Could not create user.', 'error');
        }
    }
    
    async editUser(userId, username) {
        try {
            // Create edit user modal
            const modal = this.createModal(`Edit User: ${username}`);
            
            const content = document.createElement('div');
            content.innerHTML = `
                <div class="edit-user-form">
                    <div class="form-group">
                        <label for="edit-username">Username:</label>
                        <input type="text" id="edit-username" value="${username}" placeholder="Enter new username">
                    </div>
                    <div class="form-group">
                        <label for="edit-password">New Password:</label>
                        <input type="password" id="edit-password" placeholder="Enter new password">
                    </div>
                    <div class="form-group">
                        <label for="edit-role">Role:</label>
                        <select id="edit-role">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                    <button id="save-user-btn">Save Changes</button>
                </div>
            `;
            
            // Add content to modal
            modal.querySelector('.modal-content').appendChild(content);
            
            // Add event listener for save button
            modal.querySelector('#save-user-btn').addEventListener('click', async () => {
                const newUsername = document.getElementById('edit-username').value;
                const newPassword = document.getElementById('edit-password').value;
                const newRole = document.getElementById('edit-role').value;
                
                try {
                    const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.authToken}`
                        },
                        body: JSON.stringify({
                            username: newUsername,
                            password: newPassword || undefined,
                            role: newRole
                        })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Close modal
                        this.closeModal();
                        this.openUserManagement();
                        
                        // Show success notification
                        UIUtils.showNotification(`User updated successfully!`, 'success');
                    } else {
                        UIUtils.showNotification(data.message || 'Error updating user', 'error');
                    }
                } catch (error) {
                    console.error('Error updating user:', error);
                    UIUtils.showNotification('Server error. Could not update user.', 'error');
                }
            });
        } catch (error) {
            console.error('Error preparing edit user form:', error);
            UIUtils.showNotification('Error preparing edit form', 'error');
        }
    }
    
    async deleteUser(userId, username) {
        // Prevent deleting the current user
        if (username === this.currentUser) {
            UIUtils.showNotification('Cannot delete your own account!', 'error');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }
        
        try {
            const response = await fetch(`${this.apiBaseUrl}/users/${userId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Refresh the modal
                this.closeModal();
                this.openUserManagement();
                
                // Show success notification
                UIUtils.showNotification(`User ${username} deleted successfully!`, 'success');
            } else {
                UIUtils.showNotification(data.message || 'Error deleting user', 'error');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            UIUtils.showNotification('Server error. Could not delete user.', 'error');
        }
    }
    
    /**
     * Opens the site settings management modal
     */
    openSiteSettings() {
        // Create modal for site settings
        const modal = this.createModal('Site Settings');
        
        // Create site settings content
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="site-settings-management">
                <p class="settings-intro">Configure global site settings and behavior.</p>
                
                <div class="settings-section">
                    <h4>Game Settings</h4>
                    <div class="form-group">
                        <label for="questions-to-use">Number of Questions in Trivia Game:</label>
                        <input type="number" id="questions-to-use" min="5" max="50" value="20">
                    </div>
                    <div class="form-group">
                        <label for="time-limit">Time Limit per Question (seconds):</label>
                        <input type="number" id="time-limit" min="5" max="60" value="15">
                    </div>
                </div>
                
                <div class="settings-section">
                    <h4>Game Completion Settings</h4>
                    <div class="form-group">
                        <label for="completion-threshold">Completion Threshold (%):</label>
                        <input type="number" id="completion-threshold" min="50" max="100" value="90">
                        <small>Percentage score required to mark a game as completed</small>
                    </div>
                </div>
                
                <button id="save-settings-btn" class="primary-button">Save Settings</button>
                <button id="reset-defaults-btn" class="secondary-button">Reset to Defaults</button>
            </div>
        `;
        
        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .site-settings-management {
                padding: 20px;
                max-height: 70vh;
                overflow-y: auto;
            }
            .settings-intro {
                margin-bottom: 20px;
                color: #555;
            }
            .settings-section {
                margin-bottom: 25px;
                padding: 15px;
                background-color: #f9f9f9;
                border-radius: 6px;
                border: 1px solid #e1e1e1;
            }
            .settings-section h4 {
                margin-top: 0;
                margin-bottom: 15px;
                color: #333;
                font-size: 1.1rem;
            }
            .form-group small {
                display: block;
                color: #666;
                font-size: 0.8rem;
                margin-top: 5px;
            }
            .primary-button {
                background-color: #4CAF50;
                color: white;
                border: none;
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                margin-right: 10px;
            }
            .secondary-button {
                background-color: #f5f5f5;
                color: #333;
                border: 1px solid #ddd;
                padding: 10px 15px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
            }
        `;
        document.head.appendChild(style);
        
        // Add content to modal
        modal.querySelector('.modal-content').appendChild(content);
        
        // Add event listeners
        modal.querySelector('#save-settings-btn').addEventListener('click', () => {
            const settings = {
                questionsToUse: parseInt(document.getElementById('questions-to-use').value),
                timeLimit: parseInt(document.getElementById('time-limit').value),
                completionThreshold: parseInt(document.getElementById('completion-threshold').value)
            };
            
            // Save settings to server
            this.saveSettings(settings);
        });
        
        modal.querySelector('#reset-defaults-btn').addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                document.getElementById('questions-to-use').value = '20';
                document.getElementById('time-limit').value = '15';
                document.getElementById('completion-threshold').value = '90';
                
                UIUtils.showNotification('Settings reset to defaults', 'info');
            }
        });
        
        // Load current settings
        this.loadCurrentSettings();
    }
    
    /**
     * Load current settings from server or local storage
     */
    async loadCurrentSettings() {
        try {
            // Try to get settings from server
            const response = await fetch(`${this.apiBaseUrl}/settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                
                if (data.success && data.settings) {
                    // Apply settings to form
                    document.getElementById('questions-to-use').value = data.settings.questionsToUse || 20;
                    document.getElementById('time-limit').value = data.settings.timeLimit || 15;
                    document.getElementById('completion-threshold').value = data.settings.completionThreshold || 90;
                }
            }
        } catch (error) {
            console.log('Error loading settings, using defaults:', error);
            // Use defaults if server fails
        }
    }
    
    /**
     * Save settings to server and localStorage
     * @param {Object} settings - Settings object to save
     */
    async saveSettings(settings) {
        try {
            // Always save to localStorage first for GitHub Pages compatibility
            StorageUtils.saveToStorage('siteSettings', settings);
            
            // Then try to save to server if available
            console.log('Using auth token:', this.authToken);
            
            const response = await fetch(`${this.apiBaseUrl}/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.authToken}`
                },
                body: JSON.stringify({ settings })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Server returned error:', response.status, errorText);
                throw new Error(`Server error: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                UIUtils.showNotification('Settings saved successfully!', 'success');
                this.closeModal();
            } else {
                UIUtils.showNotification(data.message || 'Error saving settings', 'error');
            }
        } catch (error) {
            console.error('Error saving settings to server:', error);
            
            // We already saved to localStorage, so just notify the user
            UIUtils.showNotification('Settings saved to local storage (server unavailable)', 'success');
            this.closeModal();
        }
    }
    
    logout() {
        this.isAuthenticated = false;
        this.authToken = null;
        this.isAdmin = false;
        this.currentUser = null;
        
        // Use StorageUtils to remove data
        StorageUtils.removeFromStorage('authInfo');
        
        this.showAuthContainer();
        
        // Show logout notification
        UIUtils.showNotification('You have been logged out', 'info');
    }
    
    checkAuthStatus() {
        // Use StorageUtils to get data
        const authInfo = StorageUtils.getFromStorage('authInfo', null);
        if (authInfo) {
            this.authToken = authInfo.token;
            this.isAuthenticated = true;
            this.isAdmin = authInfo.role === 'admin';
            this.currentUser = authInfo.username;
            this.showGamesContainer();
            this.updateUIForRole();
        }
    }
    
    showError(message) {
        this.elements.authError.textContent = message;
        this.elements.authError.style.opacity = 1;
    }
    
    clearError() {
        this.elements.authError.textContent = '';
        this.elements.authError.style.opacity = 0;
    }
    
    clearInputs() {
        this.elements.username.value = '';
        this.elements.password.value = '';
    }
    
    showAuthContainer() {
        // Use UIUtils instead of direct class manipulation
        UIUtils.showElement(this.elements.authContainer);
        UIUtils.hideElement(this.elements.gamesContainer);
    }
    
    showGamesContainer() {
        // Use UIUtils instead of direct class manipulation
        UIUtils.hideElement(this.elements.authContainer);
        UIUtils.showElement(this.elements.gamesContainer);
    }

    /**
     * Create a modal dialog
     * @param {string} title - The modal title
     * @returns {Element} The created modal element
     */
    createModal(title) {
        // Remove any existing modals
        this.closeModal();
        
        // Create modal backdrop
        const modalBackdrop = document.createElement('div');
        modalBackdrop.className = 'modal-backdrop';
        
        // Create modal container
        const modal = document.createElement('div');
        modal.className = 'modal';
        
        // Add content
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
            </div>
        `;
        
        // Add to DOM
        modalBackdrop.appendChild(modal);
        document.body.appendChild(modalBackdrop);
        
        // Add close button event
        modal.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Add backdrop click event to close
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) {
                this.closeModal();
            }
        });
        
        // Add styles
        this.applyModalStyles(modalBackdrop);
        
        return modal;
    }
    
    /**
     * Close any open modals
     */
    closeModal() {
        const modals = document.querySelectorAll('.modal-backdrop');
        modals.forEach(modal => {
            modal.remove();
        });
    }
    
    /**
     * Apply styles to a modal
     * @param {Element} modalBackdrop - The modal backdrop element
     */
    applyModalStyles(modalBackdrop) {
        // Add modal styles
        const style = document.createElement('style');
        style.textContent = `
            .modal-backdrop {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0, 0, 0, 0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 1000;
            }
            
            .modal {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                width: 80%;
                max-width: 800px;
                max-height: 90vh;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .modal-content {
                display: flex;
                flex-direction: column;
                max-height: 90vh;
                overflow: hidden;
            }
            
            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #e1e1e1;
                background-color: #f7f7f7;
            }
            
            .modal-title {
                margin: 0;
                font-size: 1.5rem;
                color: #333;
            }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #555;
                transition: color 0.2s;
            }
            
            .modal-close:hover {
                color: #e53935;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                margin-bottom: 5px;
                font-weight: bold;
            }
            
            .form-group input,
            .form-group select {
                width: 100%;
                padding: 8px;
                border: 1px solid #ddd;
                border-radius: 4px;
            }
        `;
        document.head.appendChild(style);
    }
}

// Initialize auth system
const auth = new Auth();

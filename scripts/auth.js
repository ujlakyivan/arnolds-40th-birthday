class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.isAdmin = false;
        this.authToken = null;
        this.currentUser = null;
        this.apiBaseUrl = 'http://localhost:3000/api'; // API base URL - change in production
        
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
            // Authenticate against Firestore only
            const response = await UsersService.authenticateUser(username, password);
            
            if (response.success) {
                // Store auth info in sessionStorage (persists across page refreshes but not tabs)
                const authInfo = {
                    token: response.token,
                    username: response.user.username,
                    role: response.user.role,
                    userId: response.user.id,
                    timestamp: new Date().getTime()
                };
                
                // Use sessionStorage instead of localStorage
                sessionStorage.setItem('authInfo', JSON.stringify(authInfo));
                
                this.authToken = response.token;
                this.isAuthenticated = true;
                this.isAdmin = response.user.role === 'admin';
                this.currentUser = username;
                
                this.showGamesContainer();
                this.clearError();
                this.clearInputs();
                
                // Show admin controls if admin user
                this.updateUIForRole();
                
                // Success notification
                UIUtils.showNotification(`Welcome back, ${username}!`, 'success');
                return;
            }
            
            this.showError('Invalid username or password');
        } catch (error) {
            console.error('Authentication error:', error);
            this.showError('Authentication error. Please try again.');
        }
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
        
        try {
            // Get all users and their completion status from Firestore
            const allCompletions = await GameCompletionService.getAllCompletions();
            
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
                button.addEventListener('click', async () => {
                    const username = button.getAttribute('data-username');
                    const gameId = parseInt(button.getAttribute('data-game-id'));
                    
                    // Use the GameCompletionService to reset the completion
                    const success = await GameCompletionService.resetGameCompletion(username, gameId);
                    
                    if (success) {
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
                button.addEventListener('click', async () => {
                    const username = button.getAttribute('data-username');
                    const gameId = parseInt(button.getAttribute('data-game-id'));
                    
                    // Use the GameCompletionService to mark the game as completed
                    const success = await GameCompletionService.markGameCompleted(username, gameId);
                    
                    if (success) {
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
                button.addEventListener('click', async () => {
                    const username = button.getAttribute('data-username');
                    
                    if (confirm(`Are you sure you want to reset ALL game completions for ${username}?`)) {
                        // Use the GameCompletionService to reset all completions
                        const success = await GameCompletionService.resetAllCompletions(username);
                        
                        if (success) {
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
        } catch (error) {
            console.error('Error loading game completions:', error);
            const content = document.createElement('div');
            content.innerHTML = `<p class="error-message">Error loading game completions. Please try again later.</p>`;
            modal.querySelector('.modal-content').appendChild(content);
        }
    }
    
    /**
     * Apply styles to the game completion management UI
     * @param {Element} contentElement - The content element to style
     */
    applyCompletionManagementStyles(contentElement) {
        // Add styles for completion management UI
        const style = document.createElement('style');
        style.textContent = `
            .game-completion-management {
                padding: 20px;
                max-height: 70vh;
                overflow-y: auto;
            }
            
            .completion-intro {
                margin-bottom: 20px;
                color: #555;
            }
            
            .users-completion-list {
                display: flex;
                flex-direction: column;
                gap: 30px;
            }
            
            .user-completion-section {
                background-color: #f9f9f9;
                border-radius: 8px;
                padding: 15px;
                border: 1px solid #e0e0e0;
            }
            
            .user-completion-title {
                margin-top: 0;
                margin-bottom: 5px;
                color: #333;
                font-size: 1.2rem;
            }
            
            .user-completion-count {
                color: #666;
                font-size: 0.9rem;
                margin-bottom: 15px;
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
                padding: 10px;
                background-color: white;
                border-radius: 4px;
                border: 1px solid #eee;
            }
            
            .game-completion-name {
                font-weight: bold;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .game-emoji {
                font-size: 1.2rem;
            }
            
            .game-completion-actions {
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .game-completion-status {
                padding: 4px 8px;
                border-radius: 15px;
                font-size: 0.8rem;
            }
            
            .completed {
                background-color: #e8f5e9;
                color: #2e7d32;
            }
            
            .not-completed {
                background-color: #fafafa;
                color: #757575;
            }
            
            .mark-game-completed {
                background-color: #4caf50;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
            }
            
            .reset-game-completion {
                background-color: #f44336;
                color: white;
                border: none;
                padding: 5px 10px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.8rem;
            }
            
            .reset-all-completions {
                background-color: #ff5722;
                color: white;
                border: none;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9rem;
                margin-top: 10px;
                align-self: flex-start;
            }
        `;
        document.head.appendChild(style);
    }

    async openUserManagement() {
        // Create a modal for user management
        const modal = this.createModal('User Management');
        
        try {
            // Get users from Firestore
            const users = await UsersService.getAllUsers();
            
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
            modal.querySelector('#add-user-btn').addEventListener('click', async () => {
                const newUsername = document.getElementById('new-username').value;
                const newPassword = document.getElementById('new-password').value;
                const newRole = document.getElementById('new-role').value;
                
                if (newUsername && newPassword) {
                    // Use UsersService to create user
                    const result = await UsersService.createUser(newUsername, newPassword, newRole);
                    
                    if (result.success) {
                        UIUtils.showNotification(`User ${newUsername} added successfully!`, 'success');
                        // Refresh the modal
                        this.closeModal();
                        this.openUserManagement();
                    } else {
                        UIUtils.showNotification(result.message || 'Error adding user', 'error');
                    }
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
                button.addEventListener('click', async () => {
                    const userId = button.getAttribute('data-id');
                    const username = button.getAttribute('data-username');
                    
                    // Prevent deleting the current user
                    if (username === this.currentUser) {
                        UIUtils.showNotification('Cannot delete your own account!', 'error');
                        return;
                    }
                    
                    // Confirm deletion
                    if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
                        return;
                    }
                    
                    // Use UsersService to delete user
                    const result = await UsersService.deleteUser(userId);
                    
                    if (result.success) {
                        UIUtils.showNotification(`User ${username} deleted successfully!`, 'success');
                        // Refresh the modal
                        this.closeModal();
                        this.openUserManagement();
                    } else {
                        UIUtils.showNotification(result.message || 'Error deleting user', 'error');
                    }
                });
            });
        } catch (error) {
            console.error('Error getting users:', error);
            const content = document.createElement('div');
            content.innerHTML = `<p class="error-message">Error loading users. Please try again later.</p>`;
            modal.querySelector('.modal-content').appendChild(content);
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
                        <input type="text" id="edit-username" value="${username}" disabled>
                        <small>Changing usernames is not supported</small>
                    </div>
                    <div class="form-group">
                        <label for="edit-password">New Password:</label>
                        <input type="password" id="edit-password" placeholder="Enter new password">
                        <small>Leave empty to keep current password</small>
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
                const newPassword = document.getElementById('edit-password').value;
                const newRole = document.getElementById('edit-role').value;
                
                const updates = { role: newRole };
                if (newPassword) {
                    updates.password = newPassword;
                }
                
                // Use UsersService to update user
                const result = await UsersService.updateUser(userId, updates);
                
                if (result.success) {
                    // Close modal
                    this.closeModal();
                    this.openUserManagement();
                    
                    // Show success notification
                    UIUtils.showNotification(`User updated successfully!`, 'success');
                } else {
                    UIUtils.showNotification(result.message || 'Error updating user', 'error');
                }
            });
        } catch (error) {
            console.error('Error preparing edit user form:', error);
            UIUtils.showNotification('Error preparing edit form', 'error');
        }
    }
    
    /**
     * Opens the site settings management modal
     */
    openSiteSettings() {
        // Create modal for site settings
        const modal = this.createModal('Site Settings');
        
        try {
            // Create site settings content
            const content = document.createElement('div');
            
            // Load current settings
            SettingsService.getSettings().then(settings => {
                // Create settings panel HTML
                content.innerHTML = `
                    <div class="site-settings-management">
                        <p class="settings-intro">Configure global site settings and behavior.</p>
                        
                        <div class="settings-section">
                            <h4>Game Settings</h4>
                            <div class="form-group">
                                <label for="questions-to-use">Number of Questions in Trivia Game:</label>
                                <input type="number" id="questions-to-use" min="5" max="50" value="${settings.questionsToUse || 20}">
                            </div>
                            <div class="form-group">
                                <label for="time-limit">Time Limit per Question (seconds):</label>
                                <input type="number" id="time-limit" min="5" max="60" value="${settings.timeLimit || 15}">
                            </div>
                            <div class="form-group checkbox">
                                <label for="enable-confetti">
                                    <input type="checkbox" id="enable-confetti" ${settings.enableConfetti ? 'checked' : ''}>
                                    Enable Confetti Effects
                                </label>
                            </div>
                        </div>
                        
                        <div class="settings-section">
                            <h4>Game Completion Settings</h4>
                            <div class="form-group">
                                <label for="completion-threshold">Completion Threshold (%):</label>
                                <input type="number" id="completion-threshold" min="50" max="100" value="${settings.completionThreshold || 90}">
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
                    .form-group.checkbox {
                        display: flex;
                        align-items: center;
                    }
                    .form-group.checkbox input {
                        margin-right: 8px;
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
                modal.querySelector('#save-settings-btn').addEventListener('click', async () => {
                    const newSettings = {
                        questionsToUse: parseInt(document.getElementById('questions-to-use').value, 10),
                        timeLimit: parseInt(document.getElementById('time-limit').value, 10),
                        enableConfetti: document.getElementById('enable-confetti').checked,
                        completionThreshold: parseInt(document.getElementById('completion-threshold').value, 10),
                        updatedAt: new Date().toISOString()
                    };
                    
                    // Save settings using SettingsService
                    try {
                        const result = await SettingsService.updateSettings(newSettings);
                        
                        if (result.success) {
                            UIUtils.showNotification('Settings saved successfully!', 'success');
                            this.closeModal();
                            
                            // Reload the page to apply new settings
                            setTimeout(() => {
                                window.location.reload();
                            }, 1000);
                        } else {
                            UIUtils.showNotification(result.message || 'Error saving settings', 'error');
                        }
                    } catch (err) {
                        console.error('Error saving settings:', err);
                        UIUtils.showNotification('Error saving settings: ' + err.message, 'error');
                    }
                });
                
                modal.querySelector('#reset-defaults-btn').addEventListener('click', () => {
                    if (confirm('Are you sure you want to reset all settings to defaults?')) {
                        const defaultSettings = SettingsService.getDefaultSettings();
                        document.getElementById('questions-to-use').value = defaultSettings.questionsToUse;
                        document.getElementById('time-limit').value = defaultSettings.timeLimit;
                        document.getElementById('enable-confetti').checked = defaultSettings.enableConfetti;
                        document.getElementById('completion-threshold').value = defaultSettings.completionThreshold || 90;
                        
                        UIUtils.showNotification('Settings reset to defaults', 'info');
                    }
                });
            }).catch(err => {
                console.error('Error loading settings:', err);
                content.innerHTML = '<p class="error-message">Error loading settings. Please try again later.</p>';
                modal.querySelector('.modal-content').appendChild(content);
            });
        } catch (error) {
            console.error('Error preparing settings form:', error);
            const content = document.createElement('div');
            content.innerHTML = '<p class="error-message">Error preparing settings form. Please try again later.</p>';
            modal.querySelector('.modal-content').appendChild(content);
        }
    }
    
    logout() {
        this.isAuthenticated = false;
        this.authToken = null;
        this.isAdmin = false;
        this.currentUser = null;
        
        // Clear sessionStorage
        sessionStorage.removeItem('authInfo');
        
        this.showAuthContainer();
        
        // Show logout notification
        UIUtils.showNotification('You have been logged out', 'info');
    }
    
    checkAuthStatus() {
        // Check sessionStorage for auth info
        const authInfo = JSON.parse(sessionStorage.getItem('authInfo'));
        
        if (authInfo && authInfo.token) {
            this.isAuthenticated = true;
            this.authToken = authInfo.token;
            this.isAdmin = authInfo.role === 'admin';
            this.currentUser = authInfo.username;
            
            this.showGamesContainer();
            this.updateUIForRole();
        } else {
            this.isAuthenticated = false;
            this.authToken = null;
            this.isAdmin = false;
            this.currentUser = null;
            this.showAuthContainer();
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

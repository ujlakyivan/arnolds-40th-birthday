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
    
    createAdminControls() {
        let adminControls = this.elements.adminControls;
        
        // First, let's fix the header structure for proper layout
        const header = document.querySelector('.birthday-header');
        if (header) {
            // Check if we need to restructure the header
            if (!header.querySelector('.title-container')) {
                // Get existing elements
                const headerContent = header.innerHTML;
                const logoutButton = header.querySelector('#logout-button');
                
                // Clear the header
                header.innerHTML = '';
                
                // Create title container
                const titleContainer = document.createElement('div');
                titleContainer.className = 'title-container';
                
                // Add original content except logout button
                if (logoutButton) {
                    // Remove logout button from the content
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = headerContent;
                    tempDiv.querySelector('#logout-button')?.remove();
                    titleContainer.innerHTML = tempDiv.innerHTML;
                } else {
                    titleContainer.innerHTML = headerContent;
                }
                
                // Create logout container
                const logoutContainer = document.createElement('div');
                logoutContainer.className = 'logout-button-container';
                if (logoutButton) {
                    logoutContainer.appendChild(logoutButton);
                }
                
                // Add containers to header
                header.appendChild(titleContainer);
                header.appendChild(logoutContainer);
                
                // Save references to new elements
                this.elements.logoutButton = document.getElementById('logout-button');
            }
        }
        
        // If admin controls don't exist, create them
        if (!adminControls) {
            adminControls = document.createElement('div');
            adminControls.id = 'admin-controls';
            adminControls.className = 'admin-controls';
            
            // Create admin panel HTML
            adminControls.innerHTML = `
                <h3>Admin Controls</h3>
                <div class="admin-actions">
                    <button id="user-management" class="admin-button">User Management</button>
                    <button id="game-settings" class="admin-button">Game Settings</button>
                    <button id="view-stats" class="admin-button">View Statistics</button>
                </div>
            `;
            
            // Add admin controls to the header
            if (header) {
                header.appendChild(adminControls);
                
                // Save reference to admin controls
                this.elements.adminControls = adminControls;
                
                // Add event listeners to admin buttons
                const userManagement = document.getElementById('user-management');
                if (userManagement) {
                    userManagement.addEventListener('click', () => this.openUserManagement());
                }
                
                const gameSettings = document.getElementById('game-settings');
                if (gameSettings) {
                    gameSettings.addEventListener('click', () => this.openGameSettings());
                }
                
                const viewStats = document.getElementById('view-stats');
                if (viewStats) {
                    viewStats.addEventListener('click', () => this.openStats());
                }
            }
        } else {
            // Show existing admin controls
            adminControls.classList.remove('hidden');
        }
    }
    
    hideAdminControls() {
        if (this.elements.adminControls) {
            this.elements.adminControls.classList.add('hidden');
        }
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
    
    openUserManagementFallback(modal) {
        // Get users from storage or use default list
        const users = StorageUtils.getFromStorage('users', [
            { username: 'muradin', role: 'user' },
            { username: 'admin', role: 'admin' }
        ]);
        
        // Create user management content
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="server-warning">
                <p>⚠️ Server connection failed. Using offline mode.</p>
            </div>
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
                                    <button class="edit-user" data-username="${user.username}">Edit</button>
                                    <button class="delete-user" data-username="${user.username}">Delete</button>
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
        
        // Style warning
        content.querySelector('.server-warning').style.backgroundColor = '#fff3cd';
        content.querySelector('.server-warning').style.color = '#856404';
        content.querySelector('.server-warning').style.padding = '10px';
        content.querySelector('.server-warning').style.borderRadius = '4px';
        content.querySelector('.server-warning').style.marginBottom = '15px';
        
        // Add content to modal
        modal.querySelector('.modal-content').appendChild(content);
        
        // Add event listeners for user actions
        modal.querySelector('#add-user-btn').addEventListener('click', () => {
            const newUsername = document.getElementById('new-username').value;
            const newPassword = document.getElementById('new-password').value;
            const newRole = document.getElementById('new-role').value;
            
            if (newUsername && newPassword) {
                // Add user to credentials
                this.credentials[newUsername] = { 
                    password: newPassword, 
                    role: newRole 
                };
                
                // Update users in storage
                const updatedUsers = [...users, { 
                    username: newUsername, 
                    role: newRole 
                }];
                
                StorageUtils.saveToStorage('users', updatedUsers);
                
                // Refresh the modal
                this.closeModal();
                this.openUserManagement();
                
                // Show success notification
                UIUtils.showNotification(`User ${newUsername} added successfully!`, 'success');
            } else {
                UIUtils.showNotification('Username and password are required', 'error');
            }
        });
        
        // Add event listeners for edit and delete buttons
        const editButtons = modal.querySelectorAll('.edit-user');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-username');
                this.editUserFallback(username, users);
            });
        });
        
        const deleteButtons = modal.querySelectorAll('.delete-user');
        deleteButtons.forEach(button => {
            button.addEventListener('click', () => {
                const username = button.getAttribute('data-username');
                this.deleteUserFallback(username, users);
            });
        });
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
    
    editUserFallback(username, users) {
        // Create edit user modal
        const modal = this.createModal(`Edit User: ${username}`);
        
        const userInfo = this.credentials[username];
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="server-warning">
                <p>⚠️ Server connection failed. Using offline mode.</p>
            </div>
            <div class="edit-user-form">
                <div class="form-group">
                    <label for="edit-password">New Password:</label>
                    <input type="password" id="edit-password" placeholder="Enter new password">
                </div>
                <div class="form-group">
                    <label for="edit-role">Role:</label>
                    <select id="edit-role">
                        <option value="user" ${userInfo.role === 'user' ? 'selected' : ''}>User</option>
                        <option value="admin" ${userInfo.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </div>
                <button id="save-user-btn">Save Changes</button>
            </div>
        `;
        
        // Style warning
        content.querySelector('.server-warning').style.backgroundColor = '#fff3cd';
        content.querySelector('.server-warning').style.color = '#856404';
        content.querySelector('.server-warning').style.padding = '10px';
        content.querySelector('.server-warning').style.borderRadius = '4px';
        content.querySelector('.server-warning').style.marginBottom = '15px';
        
        // Add content to modal
        modal.querySelector('.modal-content').appendChild(content);
        
        // Add event listener for save button
        modal.querySelector('#save-user-btn').addEventListener('click', () => {
            const newPassword = document.getElementById('edit-password').value;
            const newRole = document.getElementById('edit-role').value;
            
            // Update user in credentials
            if (newPassword) {
                this.credentials[username].password = newPassword;
            }
            
            this.credentials[username].role = newRole;
            
            // Update users in storage
            const updatedUsers = users.map(user => {
                if (user.username === username) {
                    return { ...user, role: newRole };
                }
                return user;
            });
            
            StorageUtils.saveToStorage('users', updatedUsers);
            
            // Close modal
            this.closeModal();
            this.openUserManagement();
            
            // Show success notification
            UIUtils.showNotification(`User ${username} updated successfully!`, 'success');
        });
    }
    
    deleteUserFallback(username, users) {
        // Prevent deleting the current user
        if (username === this.currentUser) {
            UIUtils.showNotification('Cannot delete your own account!', 'error');
            return;
        }
        
        // Confirm deletion
        if (!confirm(`Are you sure you want to delete user "${username}"?`)) {
            return;
        }
        
        // Remove user from credentials
        delete this.credentials[username];
        
        // Update users in storage
        const updatedUsers = users.filter(user => user.username !== username);
        StorageUtils.saveToStorage('users', updatedUsers);
        
        // Refresh the modal
        this.closeModal();
        this.openUserManagement();
        
        // Show success notification
        UIUtils.showNotification(`User ${username} deleted successfully!`, 'success');
    }
    
    async openGameSettings() {
        // Create a modal for game settings
        const modal = this.createModal('Game Settings');
        
        try {
            // Try to get settings from server API
            const settings = await this.getSettings();
            this.renderGameSettingsForm(modal, settings);
        } catch (error) {
            console.error('Error getting settings:', error);
            
            // Fallback to local storage if server API fails
            const settings = StorageUtils.getFromStorage('gameSettings', {
                questionsToUse: 20,
                timeLimit: 15,
                enableConfetti: true
            });
            
            this.renderGameSettingsForm(modal, settings, true);
        }
    }
    
    async getSettings() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/settings`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.authToken}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to get settings');
            }
            
            const data = await response.json();
            return data.settings || {};
        } catch (error) {
            console.error('Error getting settings:', error);
            throw error;
        }
    }
    
    renderGameSettingsForm(modal, settings, isOfflineMode = false) {
        const content = document.createElement('div');
        
        // Add offline warning if needed
        let offlineWarning = '';
        if (isOfflineMode) {
            offlineWarning = `
                <div class="server-warning">
                    <p>⚠️ Server connection failed. Using offline mode.</p>
                </div>
            `;
        }
        
        content.innerHTML = `
            ${offlineWarning}
            <div class="game-settings-form">
                <h4>General Settings</h4>
                <div class="form-group">
                    <label for="confetti-setting">Enable Confetti Effects:</label>
                    <input type="checkbox" id="confetti-setting" ${settings.enableConfetti ? 'checked' : ''}>
                </div>
                
                <h4>Trivia Game Settings</h4>
                <div class="form-group">
                    <label for="questions-count">Number of Questions:</label>
                    <input type="number" id="questions-count" value="${settings.questionsToUse}" min="5" max="50">
                </div>
                <div class="form-group">
                    <label for="time-limit">Time Limit (seconds):</label>
                    <input type="number" id="time-limit" value="${settings.timeLimit}" min="5" max="60">
                </div>
                
                <button id="save-settings-btn">Save Settings</button>
            </div>
        `;
        
        // Style warning if present
        if (isOfflineMode) {
            content.querySelector('.server-warning').style.backgroundColor = '#fff3cd';
            content.querySelector('.server-warning').style.color = '#856404';
            content.querySelector('.server-warning').style.padding = '10px';
            content.querySelector('.server-warning').style.borderRadius = '4px';
            content.querySelector('.server-warning').style.marginBottom = '15px';
        }
        
        // Add content to modal
        modal.querySelector('.modal-content').appendChild(content);
        
        // Add event listener for save button
        modal.querySelector('#save-settings-btn').addEventListener('click', async () => {
            const enableConfetti = document.getElementById('confetti-setting').checked;
            const questionsToUse = parseInt(document.getElementById('questions-count').value);
            const timeLimit = parseInt(document.getElementById('time-limit').value);
            
            const newSettings = {
                questionsToUse,
                timeLimit,
                enableConfetti
            };
            
            if (isOfflineMode) {
                // Save settings to local storage
                StorageUtils.saveToStorage('gameSettings', newSettings);
                
                // Close modal
                this.closeModal();
                
                // Show success notification
                UIUtils.showNotification('Game settings updated successfully!', 'success');
            } else {
                try {
                    // Save settings using API
                    const response = await fetch(`${this.apiBaseUrl}/settings`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${this.authToken}`
                        },
                        body: JSON.stringify({ settings: newSettings })
                    });
                    
                    const data = await response.json();
                    
                    if (data.success) {
                        // Close modal
                        this.closeModal();
                        
                        // Show success notification
                        UIUtils.showNotification('Game settings updated successfully!', 'success');
                    } else {
                        UIUtils.showNotification(data.message || 'Error updating settings', 'error');
                    }
                } catch (error) {
                    console.error('Error updating settings:', error);
                    
                    // Fallback to local storage if API fails
                    StorageUtils.saveToStorage('gameSettings', newSettings);
                    
                    // Close modal
                    this.closeModal();
                    
                    // Show partial success notification
                    UIUtils.showNotification('Settings saved locally but not on server', 'info');
                }
            }
        });
    }
    
    openStats() {
        // Create a modal for statistics
        const modal = this.createModal('Game Statistics');
        
        // Get game stats or use placeholder
        const stats = StorageUtils.getFromStorage('gameStats', {
            gamesPlayed: 27,
            topScores: {
                trivia: 95,
                memory: 120,
                words: 85
            },
            mostPopular: 'trivia'
        });
        
        const content = document.createElement('div');
        content.innerHTML = `
            <div class="game-stats">
                <h4>Usage Statistics</h4>
                <p>Total games played: <strong>${stats.gamesPlayed}</strong></p>
                <p>Most popular game: <strong>${stats.mostPopular}</strong></p>
                
                <h4>Top Scores</h4>
                <ul>
                    <li>Trivia: <strong>${stats.topScores.trivia}%</strong></li>
                    <li>Memory: <strong>${stats.topScores.memory} seconds</strong></li>
                    <li>Words: <strong>${stats.topScores.words} points</strong></li>
                </ul>
                
                <div class="admin-action-buttons">
                    <button id="reset-stats-btn">Reset Statistics</button>
                    <button id="export-stats-btn">Export Data</button>
                </div>
            </div>
        `;
        
        // Add content to modal
        modal.querySelector('.modal-content').appendChild(content);
        
        // Add event listeners for buttons
        modal.querySelector('#reset-stats-btn').addEventListener('click', () => {
            // Reset stats
            StorageUtils.saveToStorage('gameStats', {
                gamesPlayed: 0,
                topScores: {
                    trivia: 0,
                    memory: 0,
                    words: 0
                },
                mostPopular: 'none'
            });
            
            UIUtils.showNotification('Statistics reset successfully!', 'success');
            this.closeModal();
        });
        
        modal.querySelector('#export-stats-btn').addEventListener('click', () => {
            // Export stats as JSON
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(stats));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "game_stats.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
        });
    }
    
    createModal(title) {
        // Remove existing modal if present
        this.closeModal();
        
        // Create modal container
        const modalContainer = document.createElement('div');
        modalContainer.id = 'admin-modal';
        modalContainer.className = 'modal-container';
        
        // Create modal content
        modalContainer.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-dialog">
                <div class="modal-header">
                    <h3>${title}</h3>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-content"></div>
            </div>
        `;
        
        // Add modal to body
        document.body.appendChild(modalContainer);
        
        // Add event listener for close button
        modalContainer.querySelector('.modal-close').addEventListener('click', () => {
            this.closeModal();
        });
        
        // Add event listener for clicking outside modal
        modalContainer.querySelector('.modal-overlay').addEventListener('click', () => {
            this.closeModal();
        });
        
        return modalContainer;
    }
    
    closeModal() {
        const modal = document.getElementById('admin-modal');
        if (modal) {
            modal.remove();
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
}

// Initialize auth system
const auth = new Auth();

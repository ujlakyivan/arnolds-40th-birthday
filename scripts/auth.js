class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.authToken = null;
        
        // Simple hardcoded credentials for demo
        // In a real app, you'd use a secure backend
        this.credentials = {
            'muradin': 'gfy'
        };
        
        // Cache DOM elements
        this.elements = {
            loginButton: document.getElementById('login-button'),
            logoutButton: document.getElementById('logout-button'),
            authError: document.getElementById('auth-error'),
            username: document.getElementById('username'),
            password: document.getElementById('password'),
            authContainer: document.getElementById('auth-container'),
            gamesContainer: document.getElementById('games-container')
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
    
    login() {
        const username = this.elements.username.value.trim();
        const password = this.elements.password.value;
        
        // Validate inputs
        if (!username || !password) {
            this.showError('Please enter both username and password');
            return;
        }
        
        if (this.credentials[username] === password) {
            this.authenticateUser(username, password);
        } else {
            this.showError('Invalid username or password');
        }
    }
    
    authenticateUser(username, password) {
        this.isAuthenticated = true;
        this.authToken = btoa(`${username}:${password}`); // Base64 encode
        
        // Use StorageUtils instead of direct localStorage calls
        StorageUtils.saveToStorage('authToken', this.authToken);
        
        this.showGamesContainer();
        this.clearError();
        this.clearInputs();
        
        // Success notification removed
    }
    
    logout() {
        this.isAuthenticated = false;
        this.authToken = null;
        
        // Use StorageUtils to remove data
        StorageUtils.removeFromStorage('authToken');
        
        this.showAuthContainer();
        
        // Logout notification removed
    }
    
    checkAuthStatus() {
        // Use StorageUtils to get data
        const token = StorageUtils.getFromStorage('authToken', null);
        if (token) {
            this.authToken = token;
            this.isAuthenticated = true;
            this.showGamesContainer();
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

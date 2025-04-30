class Auth {
    constructor() {
        this.isAuthenticated = false;
        this.authToken = null;
        
        // Simple hardcoded credentials for demo
        // In a real app, you'd use a secure backend
        this.credentials = {
            'guest': 'birthday40'
        };
        
        this.loginButton = document.getElementById('login-button');
        this.logoutButton = document.getElementById('logout-button');
        this.authError = document.getElementById('auth-error');
        
        this.bindEvents();
        this.checkAuthStatus();
    }
    
    bindEvents() {
        this.loginButton.addEventListener('click', () => this.login());
        this.logoutButton.addEventListener('click', () => this.logout());
    }
    
    login() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (this.credentials[username] === password) {
            this.isAuthenticated = true;
            this.authToken = btoa(`${username}:${password}`); // Base64 encode
            localStorage.setItem('authToken', this.authToken);
            this.showGamesContainer();
        } else {
            this.authError.textContent = 'Invalid username or password';
        }
    }
    
    logout() {
        this.isAuthenticated = false;
        this.authToken = null;
        localStorage.removeItem('authToken');
        this.showAuthContainer();
    }
    
    checkAuthStatus() {
        const token = localStorage.getItem('authToken');
        if (token) {
            this.authToken = token;
            this.isAuthenticated = true;
            this.showGamesContainer();
        }
    }
    
    showAuthContainer() {
        document.getElementById('auth-container').classList.add('active');
        document.getElementById('auth-container').classList.remove('hidden');
        document.getElementById('games-container').classList.add('hidden');
    }
    
    showGamesContainer() {
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('auth-container').classList.remove('active');
        document.getElementById('games-container').classList.remove('hidden');
    }
}

const auth = new Auth();

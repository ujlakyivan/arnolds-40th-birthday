// Main application initialization
document.addEventListener('DOMContentLoaded', async () => {
    // Load settings from Firebase first
    let gameSettings;
    try {
        gameSettings = await SettingsService.getSettings();
        console.log('Game settings loaded:', gameSettings);
    } catch (err) {
        console.error('Error loading settings:', err);
    }
    
    // Initialize auth first since other components depend on it
    const auth = new Auth();
    
    // Initialize games component with settings
    const games = new Games(gameSettings);
    
    // Store games instance in window object for global access
    window.gamesInstance = games;
    
    // Set default values for testing
    if (location.search.includes('autofill')) {
        document.getElementById('username').value = 'guest';
        document.getElementById('password').value = 'birthday40';
    }
    
    // Check orientation on load and resize
    window.addEventListener('resize', UIUtils.checkOrientation);
    UIUtils.checkOrientation();
});

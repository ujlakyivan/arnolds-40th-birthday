// Main application initialization
document.addEventListener('DOMContentLoaded', () => {
    // Initialize auth first since other components depend on it
    const auth = new Auth();
    
    // Initialize games component
    const games = new Games();
    
    // Set default values for testing
    if (location.search.includes('autofill')) {
        document.getElementById('username').value = 'guest';
        document.getElementById('password').value = 'birthday40';
    }
    
    // Check orientation on load and resize
    window.addEventListener('resize', UIUtils.checkOrientation);
    UIUtils.checkOrientation();
});

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const games = new Games();
    
    // Set default values for testing
    if (location.search.includes('autofill')) {
        document.getElementById('username').value = 'guest';
        document.getElementById('password').value = 'birthday40';
    }
    
    // Check if the device is in landscape mode
    function checkOrientation() {
        if (window.innerWidth > window.innerHeight) {
            // If in landscape mode on mobile, show a message recommending portrait mode
            if (window.matchMedia("(max-width: 1024px)").matches) {
                if (!document.getElementById('orientation-message')) {
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
            }
        } else {
            const message = document.getElementById('orientation-message');
            if (message) {
                message.remove();
            }
        }
    }
    
    // Check orientation on load and resize
    window.addEventListener('resize', checkOrientation);
    checkOrientation();
});

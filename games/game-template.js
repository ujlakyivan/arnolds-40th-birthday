// Common game functions
document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.querySelector('.back-button');
    const startButton = document.querySelector('.start-button');
    
    // Add development message container to all game pages
    const createDevMessage = () => {
        // Check if the message already exists
        if (document.querySelector('.development-message')) {
            return;
        }
        
        const messageContainer = document.createElement('div');
        messageContainer.className = 'development-message';
        
        const gameTitle = document.querySelector('.game-header h1').textContent;
        
        messageContainer.innerHTML = `
            <h2>Game Under Development</h2>
            <p>"${gameTitle}" is currently under development for Arnold's 40th birthday celebration.</p>
            <p>Check back soon to play this exciting game!</p>
            <button class="close-message">Close</button>
        `;
        
        document.body.appendChild(messageContainer);
        
        // Handle close button click
        const closeButton = messageContainer.querySelector('.close-message');
        closeButton.addEventListener('click', () => {
            messageContainer.classList.remove('active');
        });
    };
    
    // Create the development message on page load
    createDevMessage();
    
    // Handle back button click with fixed navigation for GitHub Pages
    backButton.addEventListener('click', () => {
        // Get repository name from the current URL
        const currentUrl = window.location.href;
        const urlParts = currentUrl.split('/');
        
        // Find the index of 'games' in the path
        const gamesIndex = urlParts.findIndex(part => part === 'games');
        
        // Create the correct base URL by removing game-specific parts
        if (gamesIndex > 0) {
            // Go up two levels from the game directory
            const baseUrl = urlParts.slice(0, gamesIndex).join('/');
            window.location.href = `${baseUrl}/index.html`;
        } else {
            // Fallback to relative navigation if path structure is different
            const baseTag = document.querySelector('base');
            if (baseTag && baseTag.href) {
                window.location.href = new URL('index.html', baseTag.href).href;
            } else {
                window.location.href = '../../index.html';
            }
        }
    });
    
    // Handle start button click - show development message
    if (startButton) {
        startButton.addEventListener('click', () => {
            const devMessage = document.querySelector('.development-message');
            devMessage.classList.add('active');
        });
    }
    
    // If this game needs to retrieve which game was clicked
    const gameId = sessionStorage.getItem('currentGame');
    console.log(`Current game ID: ${gameId}`);
});

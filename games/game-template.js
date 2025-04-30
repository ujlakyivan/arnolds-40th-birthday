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
    
    // Handle back button click with improved path handling
    backButton.addEventListener('click', () => {
        // Using the base href to navigate back to root
        const baseElement = document.querySelector('base');
        if (baseElement && baseElement.getAttribute('href')) {
            // Navigate to the index.html in the base folder
            window.location.href = baseElement.getAttribute('href') + 'index.html';
        } else {
            // Fallback to direct path if no base tag
            window.location.href = '../../index.html';
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

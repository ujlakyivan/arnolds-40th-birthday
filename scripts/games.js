class Games {
    constructor() {
        // Game data
        this.games = [
            { id: 1, title: 'Birthday Quiz', image: 'quiz.png', path: 'games/quiz/', emoji: '🎓' },
            { id: 2, title: 'Memory Match', image: 'memory.png', path: 'games/memory/', emoji: '🃏' },
            { id: 3, title: 'Photo Puzzle', image: 'puzzle.png', path: 'games/puzzle/', emoji: '🧩' },
            { id: 4, title: 'Trivia Challenge', image: 'trivia.png', path: 'games/trivia/', emoji: '❓' },
            { id: 5, title: 'Word Scramble', image: 'words.png', path: 'games/words/', emoji: '📝' },
            { id: 6, title: 'Arnold Clicker', image: 'clicker.png', path: 'games/clicker/', emoji: '👆' },
            { id: 7, title: 'Birthday Racer', image: 'racer.png', path: 'games/racer/', emoji: '🏎️' },
            { id: 8, title: 'Gift Hunt', image: 'hunt.png', path: 'games/hunt/', emoji: '🎁' },
            { id: 9, title: 'Balloon Pop', image: 'balloon.png', path: 'games/balloon/', emoji: '🎈' },
            { id: 10, title: 'Cake Builder', image: 'cake.png', path: 'games/cake/', emoji: '🎂' }
        ];
        
        // Cache DOM elements
        this.elements = {
            gamesContainer: document.querySelector('.games-grid')
        };
        
        this.init();
    }
    
    init() {
        this.loadGames();
    }
    
    loadGames() {
        if (!this.elements.gamesContainer) return;
        
        this.elements.gamesContainer.innerHTML = '';
        
        this.games.forEach(game => {
            const gameElement = this.createGameElement(game);
            this.elements.gamesContainer.appendChild(gameElement);
        });
    }
    
    createGameElement(game) {
        // Create game tile element
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-tile';
        gameDiv.dataset.gameId = game.id;
        
        // Create emoji icon container
        const iconContainer = this.createEmojiIcon(game);
        
        // Create title element
        const title = document.createElement('div');
        title.className = 'game-title';
        title.textContent = game.title;
        
        // Assemble the game tile
        gameDiv.appendChild(iconContainer);
        gameDiv.appendChild(title);
        
        // Add click event
        gameDiv.addEventListener('click', () => this.launchGame(game));
        
        return gameDiv;
    }
    
    createEmojiIcon(game) {
        const imgPlaceholder = document.createElement('div');
        imgPlaceholder.className = 'game-emoji-icon';
        imgPlaceholder.style.width = '60%';
        imgPlaceholder.style.height = '60%';
        imgPlaceholder.style.display = 'flex';
        imgPlaceholder.style.alignItems = 'center';
        imgPlaceholder.style.justifyContent = 'center';
        imgPlaceholder.style.fontSize = '2.5rem';
        imgPlaceholder.style.marginBottom = '10px';
        imgPlaceholder.innerHTML = game.emoji || '🎮';
        
        return imgPlaceholder;
    }
    
    launchGame(game) {
        // Save the current game ID in sessionStorage
        StorageUtils.saveToStorage('currentGame', game.id);
        
        // Check if game path exists
        if (game.path) {
            this.navigateToGamePath(game);
        } else {
            this.showDevelopmentMessage(game);
        }
    }
    
    navigateToGamePath(game) {
        // Use PathUtils instead of manual path construction
        const gamePath = PathUtils.combinePath(game.path);
        window.location.href = gamePath;
    }
    
    showDevelopmentMessage(game) {
        // Remove existing message if present
        const existingMessage = document.getElementById('dev-message-overlay');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message overlay
        const messageOverlay = document.createElement('div');
        messageOverlay.id = 'dev-message-overlay';
        messageOverlay.className = 'dev-message-overlay';
        
        // Create message container with content
        messageOverlay.innerHTML = `
            <div class="dev-message-container">
                <div class="dev-message-emoji">${game.emoji || '🎮'}</div>
                <h2 class="dev-message-title">Game Under Development</h2>
                <p class="dev-message-text">"${game.title}" is currently under development for Arnold's 40th birthday celebration.</p>
                <button id="close-dev-message" class="dev-message-button">Close</button>
            </div>
        `;
        
        // Apply inline styles
        this.applyDevMessageStyles(messageOverlay);
        
        // Add to DOM and prevent scrolling
        document.body.appendChild(messageOverlay);
        document.body.style.overflow = 'hidden';
        
        // Add close button event
        document.getElementById('close-dev-message').addEventListener('click', () => {
            messageOverlay.remove();
            document.body.style.overflow = '';
            UIUtils.showNotification('Coming soon!', 'info', 2000);
        });
    }
    
    applyDevMessageStyles(overlay) {
        // Apply overlay styles
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.flexDirection = 'column';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        overlay.style.padding = '20px';
        overlay.style.color = 'white';
        
        // Find and style the container
        const container = overlay.querySelector('.dev-message-container');
        if (container) {
            container.style.backgroundColor = '#2c3e50';
            container.style.padding = '30px';
            container.style.borderRadius = '10px';
            container.style.textAlign = 'center';
            container.style.maxWidth = '80%';
        }
        
        // Style emoji
        const emoji = overlay.querySelector('.dev-message-emoji');
        if (emoji) {
            emoji.style.fontSize = '3rem';
            emoji.style.marginBottom = '20px';
        }
        
        // Style title
        const title = overlay.querySelector('.dev-message-title');
        if (title) {
            title.style.fontSize = '1.5rem';
            title.style.marginBottom = '15px';
        }
        
        // Style text
        const text = overlay.querySelector('.dev-message-text');
        if (text) {
            text.style.marginBottom = '20px';
        }
        
        // Style button
        const button = overlay.querySelector('.dev-message-button');
        if (button) {
            button.style.padding = '10px 20px';
            button.style.backgroundColor = '#e74c3c';
            button.style.color = 'white';
            button.style.border = 'none';
            button.style.borderRadius = '4px';
            button.style.cursor = 'pointer';
        }
    }
}

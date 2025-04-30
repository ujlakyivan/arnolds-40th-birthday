class Games {
    constructor() {
        this.gamesContainer = document.querySelector('.games-grid');
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
        
        this.loadGames();
    }
    
    loadGames() {
        this.gamesContainer.innerHTML = '';
        
        this.games.forEach(game => {
            const gameElement = this.createGameElement(game);
            this.gamesContainer.appendChild(gameElement);
        });
    }
    
    createGameElement(game) {
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-tile';
        gameDiv.dataset.gameId = game.id;
        
        // Use emoji instead of colored background
        const imgPlaceholder = document.createElement('div');
        imgPlaceholder.style.width = '60%';
        imgPlaceholder.style.height = '60%';
        imgPlaceholder.style.display = 'flex';
        imgPlaceholder.style.alignItems = 'center';
        imgPlaceholder.style.justifyContent = 'center';
        imgPlaceholder.style.fontSize = '2.5rem';
        imgPlaceholder.style.marginBottom = '10px';
        imgPlaceholder.innerHTML = game.emoji || '';
        
        const title = document.createElement('div');
        title.className = 'game-title';
        title.textContent = game.title;
        
        gameDiv.appendChild(imgPlaceholder);
        gameDiv.appendChild(title);
        
        gameDiv.addEventListener('click', () => this.launchGame(game));
        
        return gameDiv;
    }
    
    launchGame(game) {
        // Save the current game ID in sessionStorage
        sessionStorage.setItem('currentGame', game.id);
        
        // Either navigate to the game page or load it in a modal/iframe
        if (game.path) {
            // Get base href if it exists
            const baseElement = document.querySelector('base');
            const basePath = baseElement ? baseElement.getAttribute('href') || '' : '';
            
            // Apply basePath if not already in the game.path
            if (game.path.startsWith('/')) {
                window.location.href = basePath + game.path.substring(1);
            } else {
                window.location.href = basePath + game.path;
            }
        } else {
            this.showDevelopmentMessage(game);
        }
    }
    
    showDevelopmentMessage(game) {
        // Create an overlay message if it doesn't exist
        const existingMessage = document.getElementById('dev-message-overlay');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        const messageOverlay = document.createElement('div');
        messageOverlay.id = 'dev-message-overlay';
        messageOverlay.style.position = 'fixed';
        messageOverlay.style.top = '0';
        messageOverlay.style.left = '0';
        messageOverlay.style.width = '100%';
        messageOverlay.style.height = '100%';
        messageOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        messageOverlay.style.display = 'flex';
        messageOverlay.style.flexDirection = 'column';
        messageOverlay.style.justifyContent = 'center';
        messageOverlay.style.alignItems = 'center';
        messageOverlay.style.zIndex = '1000';
        messageOverlay.style.padding = '20px';
        messageOverlay.style.color = 'white';
        
        messageOverlay.innerHTML = `
            <div style="background-color: #2c3e50; padding: 30px; border-radius: 10px; text-align: center; max-width: 80%;">
                <div style="font-size: 3rem; margin-bottom: 20px;">${game.emoji || '🎮'}</div>
                <h2 style="font-size: 1.5rem; margin-bottom: 15px;">Game Under Development</h2>
                <p style="margin-bottom: 20px;">"${game.title}" is currently under development for Arnold's 40th birthday celebration.</p>
                <button id="close-dev-message" style="padding: 10px 20px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer;">Close</button>
            </div>
        `;
        
        document.body.appendChild(messageOverlay);
        document.body.style.overflow = 'hidden';  // Prevent scrolling
        
        document.getElementById('close-dev-message').addEventListener('click', () => {
            messageOverlay.remove();
            document.body.style.overflow = '';  // Restore scrolling
        });
    }
}

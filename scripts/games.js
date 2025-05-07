class Games {
    constructor(settings) {
        // Store settings from cloud
        this.settings = settings || {};
        
        // Game data
        this.games = [
            { id: 4, title: 'Wow Trivia', image: 'trivia.png', path: 'games/wow/', emoji: '❓' },
            { id: 11, title: 'Diablo Trivia', image: 'diablo.png', path: 'games/diablo/', emoji: '🔥' },
            { id: 12, title: 'Overwatch Trivia', image: 'overwatch.png', path: 'games/overwatch/', emoji: '🦸' }
        ];
        
        // Cache DOM elements
        this.elements = {
            gamesContainer: document.querySelector('.games-grid')
        };
            
        this.init();
    }
    
    init() {
        // Check if we need to create the games grid
        if (this.elements.gamesContainer) {
            this.loadGames();
        }
    }
    
    loadGames() {
        // Clear container
        this.elements.gamesContainer.innerHTML = '';
        
        // Create game tiles
        this.games.forEach(game => {
            const gameElement = this.createGameElement(game);
            this.elements.gamesContainer.appendChild(gameElement);
        });
        
        // Check if all games are completed and show winning message if so
        this.checkAllGamesCompleted();
    }
    
    createGameElement(game) {
        // Create game tile element
        const gameDiv = document.createElement('div');
        gameDiv.className = 'game-tile festive-game-tile';
        gameDiv.dataset.gameId = game.id;
        
        // Create emoji icon container
        const iconContainer = this.createEmojiIcon(game);
        
        // Create title element
        const title = document.createElement('div');
        title.className = 'game-title';
        title.textContent = game.title;
        
        // Check if game is completed and add completion indicator
        if (window.GameCompletionUtils && GameCompletionUtils.isGameCompleted(game.id)) {
            gameDiv.classList.add('completed-game');
            
            // Create completion badge
            const completionBadge = document.createElement('div');
            completionBadge.className = 'completion-badge';
            completionBadge.innerHTML = '✓';
            completionBadge.title = 'Completed!';
            
            // Style the badge
            completionBadge.style.position = 'absolute';
            completionBadge.style.top = '-10px';
            completionBadge.style.right = '-10px';
            completionBadge.style.backgroundColor = '#2ecc71';
            completionBadge.style.color = 'white';
            completionBadge.style.borderRadius = '50%';
            completionBadge.style.width = '30px';
            completionBadge.style.height = '30px';
            completionBadge.style.display = 'flex';
            completionBadge.style.justifyContent = 'center';
            completionBadge.style.alignItems = 'center';
            completionBadge.style.fontSize = '16px';
            completionBadge.style.fontWeight = 'bold';
            completionBadge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
            
            // Add badge to game tile
            gameDiv.appendChild(completionBadge);
            gameDiv.style.position = 'relative';  // Ensure proper positioning of the badge
        }
        
        // Assemble the game tile
        gameDiv.appendChild(iconContainer);
        gameDiv.appendChild(title);
        
        // Add click event
        gameDiv.addEventListener('click', () => {
            this.launchGame(game);
        });
        
        return gameDiv;
    }
    
    createEmojiIcon(game) {
        // Create container for emoji
        const container = document.createElement('div');
        container.className = 'game-icon emoji-icon';
        
        // Create emoji element
        const emoji = document.createElement('div');
        emoji.className = 'emoji';
        emoji.textContent = game.emoji;
        
        // Add to container
        container.appendChild(emoji);
        
        return container;
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
        // Create overlay for development message
        const messageOverlay = document.createElement('div');
        messageOverlay.className = 'dev-message-overlay';
        
        // Message content
        messageOverlay.innerHTML = `
            <div class="dev-message-container">
                <h2>Under Construction</h2>
                <div class="game-icon-large emoji-icon">
                    <div class="emoji">${game.emoji}</div>
                </div>
                <p>The game "${game.title}" is currently under development for Arnold's 40th birthday celebration.</p>
                <p>Check back soon to play this exciting game!</p>
                <button id="close-dev-message" class="close-button">Close</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(messageOverlay);
        
        // Apply styles
        this.applyDevMessageStyles(messageOverlay);
        
        // Prevent scrolling while overlay is active
        document.body.style.overflow = 'hidden';
        
        // Add close button event
        document.getElementById('close-dev-message').addEventListener('click', () => {
            messageOverlay.remove();
            document.body.style.overflow = '';
            UIUtils.showNotification('Coming soon!', 'info', 2000);
        });
    }
    
    applyDevMessageStyles(overlay) {
        // Apply styles to the development message overlay
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '999';
        
        const messageContainer = overlay.querySelector('.dev-message-container');
        messageContainer.style.backgroundColor = 'white';
        messageContainer.style.padding = '30px';
        messageContainer.style.borderRadius = '10px';
        messageContainer.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.maxWidth = '90%';
        messageContainer.style.width = '500px';
        
        const closeButton = overlay.querySelector('#close-dev-message');
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 25px';
        closeButton.style.backgroundColor = '#3498db';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '16px';
        closeButton.style.fontWeight = 'bold';
        
        const gameLargeIcon = overlay.querySelector('.game-icon-large');
        if (gameLargeIcon) {
            gameLargeIcon.style.fontSize = '5rem';
            gameLargeIcon.style.margin = '20px auto';
        }
    }
    
    checkAllGamesCompleted() {
        if (!window.GameCompletionUtils) return;
        
        // Get all active game IDs (only ones that have an actual path)
        const activeGameIds = this.games.filter(game => game.path).map(game => game.id);
        
        // Check if all games are completed
        if (GameCompletionUtils.areAllGamesCompleted(activeGameIds)) {
            this.showWinningMessage();
        }
    }
    
    showWinningMessage() {
        // Remove any existing winning message overlays first
        const existingOverlays = document.querySelectorAll('.winning-message-overlay');
        existingOverlays.forEach(overlay => {
            if (overlay && overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        });
        
        // Create overlay for winning message
        const messageOverlay = document.createElement('div');
        messageOverlay.className = 'winning-message-overlay';
        
        // Message content
        messageOverlay.innerHTML = `
            <div class="winning-message-container">
                <h2>Congratulations!</h2>
                <div class="trophy-icon">🏆</div>
                <p class="winning-title">You've completed all the games!</p>
                <p class="winning-subtitle">Arnold would be proud of your dedication and gaming skills!</p>
                <p class="winning-message">Thanks for being such a great sport and celebrating Arnold's 40th birthday in style!</p>
                <button id="close-winning-message" class="close-button">Continue</button>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(messageOverlay);
        
        // Apply styles
        this.applyWinningMessageStyles(messageOverlay);
        
        // Prevent scrolling while overlay is active
        document.body.style.overflow = 'hidden';
        
        // Add event listener directly using a function reference to make it easier to debug
        const handleCloseButtonClick = () => {
            console.log('Close button clicked');
            // Ensure the overlay is removed from the DOM
            if (messageOverlay && messageOverlay.parentNode) {
                messageOverlay.parentNode.removeChild(messageOverlay);
                console.log('Overlay removed');
            }
            
            // Re-enable scrolling
            document.body.style.overflow = '';
            
            // Show notification
            if (window.UIUtils) {
                UIUtils.showNotification('You\'re amazing! All games completed! 🎉', 'success', 5000);
                console.log('Success notification shown');
            }
        };
        
        // Use setTimeout to ensure DOM is ready before attaching the listener
        setTimeout(() => {
            const closeButton = document.getElementById('close-winning-message');
            if (closeButton) {
                console.log('Close button found, attaching event listener');
                // Remove any existing click listeners first
                closeButton.removeEventListener('click', handleCloseButtonClick);
                // Add the click listener
                closeButton.addEventListener('click', handleCloseButtonClick);
                
                // Make sure the button is clearly clickable
                closeButton.style.cursor = 'pointer';
                closeButton.style.position = 'relative';
                closeButton.style.zIndex = '1500'; // Ensure it's above other elements
            } else {
                console.error('Close button not found');
            }
        }, 100);
    }
    
    applyWinningMessageStyles(overlay) {
        // Apply styles to the winning message overlay
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        overlay.style.display = 'flex';
        overlay.style.justifyContent = 'center';
        overlay.style.alignItems = 'center';
        overlay.style.zIndex = '1000';
        
        const messageContainer = overlay.querySelector('.winning-message-container');
        messageContainer.style.backgroundColor = 'white';
        messageContainer.style.padding = '40px';
        messageContainer.style.borderRadius = '15px';
        messageContainer.style.boxShadow = '0 0 30px rgba(255,215,0,0.7)';
        messageContainer.style.textAlign = 'center';
        messageContainer.style.maxWidth = '90%';
        messageContainer.style.width = '600px';
        messageContainer.style.border = '3px solid gold';
        messageContainer.style.animation = 'pulse 2s infinite';
        
        // Add keyframe animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% { box-shadow: 0 0 30px rgba(255,215,0,0.7); }
                50% { box-shadow: 0 0 50px rgba(255,215,0,0.9); }
                100% { box-shadow: 0 0 30px rgba(255,215,0,0.7); }
            }
            
            @keyframes bounce {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
        
        const title = overlay.querySelector('h2');
        title.style.color = '#f1c40f';
        title.style.fontSize = '36px';
        title.style.margin = '0 0 20px 0';
        
        const trophyIcon = overlay.querySelector('.trophy-icon');
        trophyIcon.style.fontSize = '80px';
        trophyIcon.style.margin = '20px 0';
        trophyIcon.style.display = 'block';
        trophyIcon.style.animation = 'bounce 2s infinite';
        
        const winningTitle = overlay.querySelector('.winning-title');
        winningTitle.style.fontSize = '24px';
        winningTitle.style.fontWeight = 'bold';
        winningTitle.style.margin = '20px 0';
        
        const winningSubtitle = overlay.querySelector('.winning-subtitle');
        winningSubtitle.style.fontSize = '18px';
        winningSubtitle.style.margin = '10px 0';
        
        const winningMessage = overlay.querySelector('.winning-message');
        winningMessage.style.margin = '20px 0';
        
        const closeButton = overlay.querySelector('#close-winning-message');
        closeButton.style.marginTop = '30px';
        closeButton.style.padding = '12px 30px';
        closeButton.style.backgroundColor = '#f1c40f';
        closeButton.style.color = 'white';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        closeButton.style.fontSize = '18px';
        closeButton.style.fontWeight = 'bold';
        closeButton.style.transition = 'all 0.3s';
        
        // Add hover effect
        closeButton.onmouseover = () => {
            closeButton.style.backgroundColor = '#f39c12';
            closeButton.style.transform = 'scale(1.05)';
        };
        closeButton.onmouseout = () => {
            closeButton.style.backgroundColor = '#f1c40f';
            closeButton.style.transform = 'scale(1)';
        };
    }
    
    /**
     * Refreshes the game tiles to reflect updated completion status
     * This method is called when completion status changes in Firebase
     */
    refreshGameTiles() {
        // Only refresh if we have a games container
        if (!this.elements.gamesContainer) return;
        
        // Get all game tile elements
        const gameTiles = this.elements.gamesContainer.querySelectorAll('.game-tile');
        
        // Update each game tile
        gameTiles.forEach(tile => {
            const gameId = parseInt(tile.dataset.gameId);
            
            // Skip tiles without a game ID
            if (isNaN(gameId)) return;
            
            // Check completion status
            const isCompleted = window.GameCompletionUtils && GameCompletionUtils.isGameCompleted(gameId);
            
            // Update the completion status UI
            if (isCompleted) {
                // Add completed class if not already present
                if (!tile.classList.contains('completed-game')) {
                    tile.classList.add('completed-game');
                    
                    // Create and add completion badge if it doesn't exist
                    if (!tile.querySelector('.completion-badge')) {
                        const completionBadge = document.createElement('div');
                        completionBadge.className = 'completion-badge';
                        completionBadge.innerHTML = '✓';
                        completionBadge.title = 'Completed!';
                        
                        // Style the badge
                        completionBadge.style.position = 'absolute';
                        completionBadge.style.top = '-10px';
                        completionBadge.style.right = '-10px';
                        completionBadge.style.backgroundColor = '#2ecc71';
                        completionBadge.style.color = 'white';
                        completionBadge.style.borderRadius = '50%';
                        completionBadge.style.width = '30px';
                        completionBadge.style.height = '30px';
                        completionBadge.style.display = 'flex';
                        completionBadge.style.justifyContent = 'center';
                        completionBadge.style.alignItems = 'center';
                        completionBadge.style.fontSize = '16px';
                        completionBadge.style.fontWeight = 'bold';
                        completionBadge.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
                        
                        // Ensure tile has relative positioning for badge placement
                        tile.style.position = 'relative';
                        
                        // Add badge to game tile
                        tile.appendChild(completionBadge);
                    }
                }
            } else {
                // Remove completed class and badge if present
                tile.classList.remove('completed-game');
                const badge = tile.querySelector('.completion-badge');
                if (badge) {
                    badge.remove();
                }
            }
        });
        
        // Check if all games are completed and show winning message if so
        this.checkAllGamesCompleted();
    }
}

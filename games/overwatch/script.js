/**
 * Overwatch Trivia Game
 * For Arnold's 40th Birthday
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Debug: Log StorageUtils availability at startup
    console.log('StorageUtils available:', !!window.StorageUtils);
    
    // Remove the development message completely
    const devMessage = document.querySelector('.development-message');
    if (devMessage) {
        devMessage.remove();
    }
    
    // Remove the old start button event listener and create a new one
    const startButton = document.querySelector('.start-button');
    const newStartButton = startButton.cloneNode(true);
    startButton.parentNode.replaceChild(newStartButton, startButton);
    
    // Game state
    const gameState = {
        currentQuestion: 0,
        score: 0,
        questions: [],
        questionsToUse: 20, // Default value, will be overridden by settings
        timeLimit: 15, // Default value, will be overridden by settings
        completionThreshold: 70, // Default value, will be overridden by settings
        timerInterval: null,
        answerSelected: false,
        gameId: 12 // Overwatch Trivia game ID
    };

    // DOM Element references
    const elements = {
        introScreen: document.querySelector('.intro-screen'),
        loadingContainer: document.querySelector('.loading-container'),
        gameContainer: document.querySelector('.overwatch-trivia-game'),
        resultContainer: document.querySelector('.result-container'),
        startButton: newStartButton,
        nextButton: document.getElementById('next-button'),
        replayButton: document.querySelector('.replay-button'),
        questionText: document.getElementById('question-text'),
        questionImage: document.getElementById('question-image'),
        optionsContainer: document.getElementById('options-container'),
        currentScore: document.getElementById('current-score'),
        totalQuestions: document.getElementById('total-questions'),
        currentQuestionNum: document.getElementById('current-question-num'),
        totalQuestionsNum: document.getElementById('total-questions-num'),
        finalScore: document.getElementById('final-score'),
        finalTotal: document.getElementById('final-total'),
        resultMessage: document.getElementById('result-message'),
        timerFill: document.querySelector('.timer-fill')
    };

    // Event listeners
    elements.startButton.addEventListener('click', startGame);
    elements.nextButton.addEventListener('click', nextQuestion);
    elements.replayButton.addEventListener('click', restartGame);

    /**
     * Load settings from Firebase using SettingsService
     * @returns {Promise<Object>} - Promise resolving to settings object
     */
    async function loadSettings() {
        try {
            if (window.SettingsService && typeof window.SettingsService.getSettings === 'function') {
                const settings = await window.SettingsService.getSettings();
                if (settings && settings.games && settings.games.overwatch) {
                    return settings.games.overwatch;
                }
            }
            return {}; // Return empty object if no settings found
        } catch (error) {
            console.error('Error loading settings:', error);
            return {}; // Return empty object on error
        }
    }

    /**
     * Load questions from Firestore
     * @returns {Promise<Array>} - Promise resolving to array of questions
     */
    async function loadQuestions() {
        try {
            // Only get questions from Firestore, no fallbacks
            if (firebase && firebase.firestore) {
                console.log('Firebase initialized, loading questions from Firestore');
                
                const db = firebase.firestore();
                const questionsSnapshot = await db.collection('overwatchQuestions').get();
                
                if (!questionsSnapshot.empty) {
                    console.log('Successfully loaded questions from Firestore');
                    return questionsSnapshot.docs.map(doc => doc.data());
                } else {
                    console.warn('No questions found in Firestore');
                    throw new Error('No questions available in Firestore');
                }
            } else {
                throw new Error('Firebase is not initialized');
            }
        } catch (error) {
            console.error('Error loading questions:', error);
            throw error; // Propagate error to be handled by startGame
        }
    }

    /**
     * Start the game
     */
    async function startGame() {
        // Hide intro screen
        elements.introScreen.style.display = 'none';
        
        // Show loading screen
        elements.loadingContainer.classList.add('active');
        
        try {
            // Load settings first
            const settings = await loadSettings();
            
            // Update game state with settings
            gameState.questionsToUse = settings.questionsToUse || gameState.questionsToUse;
            gameState.timeLimit = settings.timeLimit || gameState.timeLimit;
            gameState.completionThreshold = settings.completionThreshold || gameState.completionThreshold;
            
            // Load questions from Firestore
            const allQuestions = await loadQuestions();
            
            if (allQuestions.length === 0) {
                throw new Error('No questions available');
            }
            
            // Select random questions from the question pool
            const randomQuestions = shuffleArray([...allQuestions]).slice(0, gameState.questionsToUse);
            gameState.questions = randomQuestions;
            
            // Set total questions in UI
            elements.totalQuestions.textContent = gameState.questionsToUse;
            elements.finalTotal.textContent = gameState.questionsToUse;
            elements.totalQuestionsNum.textContent = gameState.questionsToUse;

            // Initialize game state
            gameState.currentQuestion = 0;
            gameState.score = 0;

            // Hide loading screen
            elements.loadingContainer.classList.remove('active');
            
            // Show game container
            elements.gameContainer.classList.add('active');
            
            // Start with first question
            showQuestion(gameState.currentQuestion);
        } catch (error) {
            console.error('Game initialization error:', error);
            alert('Failed to load Overwatch trivia questions. Please try again later.');
            
            // Hide loading and go back to intro
            elements.loadingContainer.classList.remove('active');
            elements.introScreen.style.display = 'flex';
        }
    }

    /**
     * Show a specific question
     * @param {number} index - Question index to display
     */
    function showQuestion(index) {
        // Reset state for new question
        gameState.answerSelected = false;
        elements.nextButton.disabled = true;
        elements.optionsContainer.innerHTML = '';

        // Get current question
        const question = gameState.questions[index];

        // Update UI
        elements.questionText.textContent = question.question;
        
        // Update question number (1-based for display)
        elements.currentQuestionNum.textContent = index + 1;
        
        // Hide question image since we're not using images
        if (elements.questionImage) {
            elements.questionImage.style.display = 'none';
        }
        
        elements.currentScore.textContent = gameState.score;

        // Create options
        const shuffledOptions = shuffleArray([...question.options]);
        shuffledOptions.forEach(option => {
            const button = document.createElement('button');
            button.classList.add('option-button');
            button.textContent = option;
            button.addEventListener('click', () => selectAnswer(option, question.answer));
            elements.optionsContainer.appendChild(button);
        });

        // Start timer
        startTimer();
    }

    /**
     * Handle answer selection
     * @param {string} selected - The selected option
     * @param {string} correct - The correct answer
     */
    function selectAnswer(selected, correct) {
        if (gameState.answerSelected) return; // Prevent multiple selections
        
        // Mark current question as answered
        gameState.answerSelected = true;
        
        // Clear timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        // Check if answer is correct
        const isCorrect = selected === correct;
        
        // Get all options
        const options = elements.optionsContainer.querySelectorAll('.option-button');
        
        // Update UI
        options.forEach(option => {
            if (option.textContent === selected) {
                option.classList.add(isCorrect ? 'correct' : 'incorrect');
            } else if (option.textContent === correct) {
                option.classList.add('correct');
            }
            
            // Disable all options
            option.disabled = true;
        });
        
        // Update score if correct
        if (isCorrect) {
            gameState.score++;
            elements.currentScore.textContent = gameState.score;
        }
        
        // Enable next button
        elements.nextButton.disabled = false;
    }

    /**
     * Move to next question
     */
    function nextQuestion() {
        // Move to next question
        gameState.currentQuestion++;
        
        // Check if we've reached the end
        if (gameState.currentQuestion >= gameState.questions.length) {
            showResults();
        } else {
            showQuestion(gameState.currentQuestion);
        }
    }

    /**
     * Show final results
     */
    function showResults() {
        // Hide game container
        elements.gameContainer.classList.remove('active');
        
        // Show results
        elements.resultContainer.classList.add('active');
        
        // Update result text
        elements.finalScore.textContent = gameState.score;
        
        // Different messages based on score
        const scorePercentage = (gameState.score / gameState.questions.length) * 100;
        let message = '';
        
        // Debug info
        console.log('Game completion check:', {
            score: gameState.score,
            totalQuestions: gameState.questions.length,
            scorePercentage: scorePercentage,
            completionThreshold: gameState.completionThreshold,
            isAboveThreshold: scorePercentage >= gameState.completionThreshold,
            gameId: gameState.gameId
        });
        
        if (scorePercentage === 100) {
            message = 'Incredible! You are a true Overwatch master!';
        } else if (scorePercentage >= 80) {
            message = 'Amazing work! The world could always use more heroes like you!';
        } else if (scorePercentage >= 60) {
            message = 'Good job! Your Overwatch knowledge is impressive!';
        } else if (scorePercentage >= 40) {
            message = 'Not bad! With more practice, you could join the Overwatch team!';
        } else {
            message = 'Keep playing Overwatch to improve your knowledge!';
        }
        
        // Mark game as completed if score is equal to or higher than completion threshold
        if (scorePercentage >= gameState.completionThreshold) {
            if (window.GameCompletionService && typeof window.GameCompletionService.markGameCompleted === 'function') {
                // Using GameCompletionService for Firestore instead of GameCompletionUtils
                const authInfo = window.StorageUtils ? window.StorageUtils.getFromStorage('authInfo', null) : null;
                if (authInfo && authInfo.username) {
                    window.GameCompletionService.markGameCompleted(authInfo.username, gameState.gameId)
                        .then(success => {
                            console.log('Game completion mark attempt with Firestore:', success);
                        })
                        .catch(err => {
                            console.error('Error marking game as completed with Firestore:', err);
                            // Fallback to old method if Firestore fails
                            if (window.GameCompletionUtils && typeof window.GameCompletionUtils.markGameCompleted === 'function') {
                                const success = window.GameCompletionUtils.markGameCompleted(gameState.gameId);
                                console.log('Fallback game completion mark attempt:', success);
                            }
                        });
                } else {
                    // Fallback to old method if no auth info
                    if (window.GameCompletionUtils && typeof window.GameCompletionUtils.markGameCompleted === 'function') {
                        const success = window.GameCompletionUtils.markGameCompleted(gameState.gameId);
                        console.log('Fallback game completion mark attempt:', success);
                    }
                }
                
                // Add completion message to the result
                message += ' 🏆 You\'ve completed this game!';
            } else if (window.GameCompletionUtils && typeof window.GameCompletionUtils.markGameCompleted === 'function') {
                // Fallback to old GameCompletionUtils if GameCompletionService not available
                const success = window.GameCompletionUtils.markGameCompleted(gameState.gameId);
                console.log('Game completion mark attempt with legacy method:', success);
                
                // Add completion message to the result
                message += ' 🏆 You\'ve completed this game!';
            } else {
                console.error('Neither GameCompletionService nor GameCompletionUtils available');
            }
        }
        
        elements.resultMessage.textContent = message;
    }

    /**
     * Restart the game
     */
    function restartGame() {
        // Hide results
        elements.resultContainer.classList.remove('active');
        
        // Show intro screen
        elements.introScreen.style.display = 'flex';
    }

    /**
     * Start the timer for answering a question
     */
    function startTimer() {
        // Reset timer UI
        elements.timerFill.style.width = '100%';
        
        // Clear any existing interval
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
        }
        
        const startTime = Date.now();
        const timeLimit = gameState.timeLimit * 1000; // convert to ms
        
        gameState.timerInterval = setInterval(() => {
            // Calculate how much time has passed
            const elapsedTime = Date.now() - startTime;
            const remainingPercent = Math.max(0, 100 - (elapsedTime / timeLimit) * 100);
            
            // Update timer bar
            elements.timerFill.style.width = `${remainingPercent}%`;
            
            // If time is up
            if (elapsedTime >= timeLimit && !gameState.answerSelected) {
                clearInterval(gameState.timerInterval);
                timeUp();
            }
        }, 100);
    }

    /**
     * Handle when time runs out
     */
    function timeUp() {
        // Mark current question as answered
        gameState.answerSelected = true;
        
        // Get all options
        const options = elements.optionsContainer.querySelectorAll('.option-button');
        const currentQuestion = gameState.questions[gameState.currentQuestion];
        
        // Highlight the correct answer
        options.forEach(option => {
            if (option.textContent === currentQuestion.answer) {
                option.classList.add('correct');
            }
            
            // Disable all options
            option.disabled = true;
        });
        
        // Enable next button
        elements.nextButton.disabled = false;
    }

    /**
     * Shuffle array elements (Fisher-Yates algorithm)
     * @param {Array} array - The array to shuffle
     * @returns {Array} - The shuffled array
     */
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
});
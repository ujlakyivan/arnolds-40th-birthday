/**
 * World of Warcraft Trivia Game
 * For Arnold's 40th Birthday
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
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
        completionThreshold: 90, // Default value, will be overridden by settings
        timerInterval: null,
        answerSelected: false,
        gameId: 4 // Trivia Challenge game ID
    };

    // DOM Element references
    const elements = {
        introScreen: document.querySelector('.intro-screen'),
        loadingContainer: document.querySelector('.loading-container'),
        gameContainer: document.querySelector('.wow-trivia-game'),
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
     * Load settings from the server
     * @returns {Promise<Object>} - Promise resolving to settings object
     */
    async function loadSettings() {
        try {
            const response = await fetch('../../server/settings.json');
            if (!response.ok) {
                throw new Error('Failed to load settings');
            }
            return await response.json();
        } catch (error) {
            console.error('Error loading settings:', error);
            // Return default settings if there's an error
            return {
                questionsToUse: gameState.questionsToUse,
                timeLimit: gameState.timeLimit,
                completionThreshold: gameState.completionThreshold
            };
        }
    }

    /**
     * Load questions from JSON file
     * @returns {Promise<Array>} - Promise resolving to array of questions
     */
    async function loadQuestions() {
        try {
            // Use the correct path that accounts for the base href
            const response = await fetch('games/trivia/questions.json');
            if (!response.ok) {
                throw new Error('Failed to load questions');
            }
            const data = await response.json();
            return data.questions || [];
        } catch (error) {
            console.error('Error loading questions:', error);
            // Return empty array if there's an error
            return [];
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
            
            // Load questions from JSON file
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
            alert('Failed to load trivia questions. Please try again later.');
            
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
        
        // Hide question image since we're not using images anymore
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
        // Only allow selection if none made yet
        if (gameState.answerSelected) return;
        
        // Stop timer
        clearInterval(gameState.timerInterval);
        
        // Mark as answered
        gameState.answerSelected = true;
        
        // Get all options
        const options = elements.optionsContainer.querySelectorAll('.option-button');
        
        // Mark the correct answer and the selected one
        options.forEach(option => {
            if (option.textContent === correct) {
                option.classList.add('correct');
            }
            
            if (option.textContent === selected && selected !== correct) {
                option.classList.add('incorrect');
            }
            
            // Disable all options
            option.disabled = true;
        });
        
        // Update score if correct
        if (selected === correct) {
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
            gameId: gameState.gameId,
            GameCompletionUtils: !!window.GameCompletionUtils,
            authInfo: window.StorageUtils ? window.StorageUtils.getFromStorage('authInfo', null) : null
        });
        
        if (scorePercentage === 100) {
            message = 'Amazing! You are a true Champion of Azeroth!';
        } else if (scorePercentage >= 80) {
            message = 'Well done! The Kirin Tor would be impressed with your knowledge!';
        } else if (scorePercentage >= 60) {
            message = 'Good job! You know your way around Azeroth pretty well!';
        } else if (scorePercentage >= 40) {
            message = 'Not bad! With some more questing, you could become a true hero.';
        } else {
            message = 'Looks like you need more time in Azeroth! Keep exploring!';
        }
        
        // Mark game as completed if score is equal to or higher than completion threshold
        if (scorePercentage >= gameState.completionThreshold) {
            if (window.GameCompletionUtils && typeof window.GameCompletionUtils.markGameCompleted === 'function') {
                const success = window.GameCompletionUtils.markGameCompleted(gameState.gameId);
                console.log('Game completion mark attempt:', success);
                
                // Add completion message to the result
                message += ' 🏆 You\'ve completed this game!';
            } else {
                console.error('GameCompletionUtils not available:', window.GameCompletionUtils);
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
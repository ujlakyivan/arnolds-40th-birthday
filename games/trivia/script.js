/**
 * World of Warcraft Trivia Game
 * For Arnold's 40th Birthday
 */

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', () => {
    // Game state
    const gameState = {
        currentQuestion: 0,
        score: 0,
        questions: [],
        timeLimit: 15,
        timerInterval: null,
        answerSelected: false
    };

    // DOM Element references
    const elements = {
        introScreen: document.querySelector('.intro-screen'),
        loadingContainer: document.querySelector('.loading-container'),
        gameContainer: document.querySelector('.wow-trivia-game'),
        resultContainer: document.querySelector('.result-container'),
        startButton: document.querySelector('.start-button'),
        nextButton: document.getElementById('next-button'),
        replayButton: document.querySelector('.replay-button'),
        questionText: document.getElementById('question-text'),
        questionImage: document.getElementById('question-image'),
        optionsContainer: document.getElementById('options-container'),
        currentScore: document.getElementById('current-score'),
        totalQuestions: document.getElementById('total-questions'),
        finalScore: document.getElementById('final-score'),
        finalTotal: document.getElementById('final-total'),
        resultMessage: document.getElementById('result-message'),
        timerFill: document.querySelector('.timer-fill'),
        devMessage: document.querySelector('.development-message')
    };

    // Event listeners
    elements.startButton.addEventListener('click', startGame);
    elements.nextButton.addEventListener('click', nextQuestion);
    elements.replayButton.addEventListener('click', restartGame);

    // WoW trivia questions (fallback in case API is not available)
    const triviaQuestions = [
        {
            question: "Which race is known for its engineering skill and explosive inventions?",
            options: ["Gnomes", "Dwarves", "Goblins", "Humans"],
            answer: "Gnomes",
            image: "https://static.wikia.nocookie.net/wowpedia/images/3/3c/Wikiracegnome.png"
        },
        {
            question: "Who is the current Warchief of the Horde?",
            options: ["Garrosh Hellscream", "Vol'jin", "Sylvanas Windrunner", "Thrall"],
            answer: "Thrall",
            image: "https://static.wikia.nocookie.net/wowpedia/images/4/4a/Thrall_the_Earth-Warder_TCG.jpg"
        },
        {
            question: "Which of these is NOT one of the original playable races?",
            options: ["Orcs", "Humans", "Blood Elves", "Tauren"],
            answer: "Blood Elves",
            image: "https://static.wikia.nocookie.net/wowpedia/images/d/d0/Blood_elves_banner.jpg"
        },
        {
            question: "What is the name of the main continent in classic World of Warcraft?",
            options: ["Northrend", "Eastern Kingdoms", "Kalimdor", "Pandaria"],
            answer: "Eastern Kingdoms",
            image: "https://static.wikia.nocookie.net/wowpedia/images/d/d0/Chronicle_-_Eastern_Kingdoms_map.jpg"
        },
        {
            question: "Who was the first Lich King?",
            options: ["Arthas Menethil", "Ner'zhul", "Bolvar Fordragon", "Kil'jaeden"],
            answer: "Ner'zhul",
            image: "https://static.wikia.nocookie.net/wowpedia/images/5/5c/Ner%27zhul_draenei.jpg"
        },
        {
            question: "Which dragon aspect was corrupted and became Deathwing?",
            options: ["Alexstrasza", "Malygos", "Nozdormu", "Neltharion"],
            answer: "Neltharion",
            image: "https://static.wikia.nocookie.net/wowpedia/images/5/51/Deathwing_Cataclysm.jpg"
        },
        {
            question: "What is the capital city of the Night Elves?",
            options: ["Orgrimmar", "Darnassus", "Silvermoon", "Undercity"],
            answer: "Darnassus",
            image: "https://static.wikia.nocookie.net/wowpedia/images/7/75/Darnassus_Burning.jpg"
        },
        {
            question: "Which character is known as 'The Banshee Queen'?",
            options: ["Jaina Proudmoore", "Sylvanas Windrunner", "Tyrande Whisperwind", "Alleria Windrunner"],
            answer: "Sylvanas Windrunner",
            image: "https://static.wikia.nocookie.net/wowpedia/images/a/a6/Sylvanas_in_Shadowlands.jpg"
        },
        {
            question: "What class was added in the Burning Crusade expansion?",
            options: ["Death Knight", "Monk", "Blood Elf", "Demon Hunter"],
            answer: "Blood Elf",
            image: "https://static.wikia.nocookie.net/wowpedia/images/2/2a/Blood_Elves_banner.jpg"
        },
        {
            question: "Who is the dwarf character shown in the login screen of Classic WoW?",
            options: ["Brann Bronzebeard", "Magni Bronzebeard", "Muradin Bronzebeard", "Moira Thaurissan"],
            answer: "Muradin Bronzebeard",
            image: "https://static.wikia.nocookie.net/wowpedia/images/c/cf/Muradin_Bronzebeard_in_Howling_Fjord.jpg"
        }
    ];

    /**
     * Start the game
     */
    function startGame() {
        // Hide intro screen
        elements.introScreen.style.display = 'none';
        
        // Show loading screen
        elements.loadingContainer.classList.add('active');
        
        // Set total questions in UI
        elements.totalQuestions.textContent = triviaQuestions.length;
        elements.finalTotal.textContent = triviaQuestions.length;

        // Initialize game with trivia questions
        gameState.questions = shuffleArray([...triviaQuestions]);
        gameState.currentQuestion = 0;
        gameState.score = 0;

        // Use setTimeout to simulate API loading
        setTimeout(() => {
            // Hide loading screen
            elements.loadingContainer.classList.remove('active');
            
            // Show game container
            elements.gameContainer.classList.add('active');
            
            // Start with first question
            showQuestion(gameState.currentQuestion);
        }, 2000);
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
        elements.questionImage.style.backgroundImage = `url(${question.image})`;
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
    
    // In a real implementation, you would connect to the Blizzard API like this:
    /*
    async function fetchWoWData() {
        try {
            // Client credentials flow for Blizzard API
            const credentials = btoa(`${clientId}:${clientSecret}`);
            
            // Get access token
            const tokenResponse = await fetch('https://us.battle.net/oauth/token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${credentials}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: 'grant_type=client_credentials'
            });
            
            const tokenData = await tokenResponse.json();
            const accessToken = tokenData.access_token;
            
            // Example: Fetch character data
            const characterResponse = await fetch('https://us.api.blizzard.com/profile/wow/character/realm/character-name?namespace=profile-us', {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Battlenet-Namespace': 'profile-us'
                }
            });
            
            const characterData = await characterResponse.json();
            return characterData;
        } catch (error) {
            console.error('Error fetching WoW data:', error);
            return null;
        }
    }
    */
});
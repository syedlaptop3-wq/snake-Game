// Game configuration
const GRID_SIZE = 20;
const CELL_SIZE = 20;

// Speed settings for different modes (milliseconds between updates)
const SPEEDS = {
    easy: 150,
    normal: 100,
    hard: 60
};

// Game state
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let gameLoop = null;
let score = 0;
let currentMode = 'easy';
let isPaused = false;
let highScores = {
    easy: 0,
    normal: 0,
    hard: 0
};

// DOM elements
const modeSelection = document.getElementById('modeSelection');
const gameScreen = document.getElementById('gameScreen');
const gameOver = document.getElementById('gameOver');
const scoreElement = document.getElementById('score');
const currentModeElement = document.getElementById('currentMode');
const highScoreElement = document.getElementById('highScore');
const finalScoreElement = document.getElementById('finalScore');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const backBtn = document.getElementById('backBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const changeModeBtn = document.getElementById('changeModeBtn');

// Initialize the game
function init() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    
    // Load high scores from localStorage
    const savedScores = localStorage.getItem('snakeHighScores');
    if (savedScores) {
        highScores = JSON.parse(savedScores);
    }
    
    // Mode selection buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentMode = btn.dataset.mode;
            startGame();
        });
    });
    
    // Control buttons
    pauseBtn.addEventListener('click', togglePause);
    restartBtn.addEventListener('click', () => startGame());
    backBtn.addEventListener('click', showModeSelection);
    playAgainBtn.addEventListener('click', () => startGame());
    changeModeBtn.addEventListener('click', showModeSelection);
    
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
}

// Start the game
function startGame() {
    // Reset game state
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    isPaused = false;
    
    // Generate first food
    generateFood();
    
    // Update UI
    scoreElement.textContent = score;
    currentModeElement.textContent = currentMode.charAt(0).toUpperCase() + currentMode.slice(1);
    highScoreElement.textContent = highScores[currentMode];
    pauseBtn.textContent = 'Pause';
    
    // Show game screen
    modeSelection.classList.add('hidden');
    gameOver.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Start game loop
    if (gameLoop) clearInterval(gameLoop);
    gameLoop = setInterval(update, SPEEDS[currentMode]);
    
    // Initial draw
    draw();
}

// Game update loop
function update() {
    if (isPaused) return;
    
    // Update direction
    direction = nextDirection;
    
    // Calculate new head position
    const head = { ...snake[0] };
    
    switch (direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // Check wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
        endGame();
        return;
    }
    
    // Check self collision
    if (snake.some(segment => segment.x === head.x && segment.y === head.y)) {
        endGame();
        return;
    }
    
    // Add new head
    snake.unshift(head);
    
    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreElement.textContent = score;
        generateFood();
    } else {
        // Remove tail if no food eaten
        snake.pop();
    }
    
    draw();
}

// Draw the game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid (subtle)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    for (let i = 0; i <= GRID_SIZE; i++) {
        ctx.beginPath();
        ctx.moveTo(i * CELL_SIZE, 0);
        ctx.lineTo(i * CELL_SIZE, canvas.height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * CELL_SIZE);
        ctx.lineTo(canvas.width, i * CELL_SIZE);
        ctx.stroke();
    }
    
    // Draw snake
    snake.forEach((segment, index) => {
        if (index === 0) {
            // Head - darker green
            ctx.fillStyle = '#2ecc71';
        } else {
            // Body - lighter green
            ctx.fillStyle = '#52d681';
        }
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            CELL_SIZE - 2
        );
        
        // Add some shading
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(
            segment.x * CELL_SIZE + 1,
            segment.y * CELL_SIZE + 1,
            CELL_SIZE - 2,
            (CELL_SIZE - 2) / 2
        );
    });
    
    // Draw food
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2,
        food.y * CELL_SIZE + CELL_SIZE / 2,
        CELL_SIZE / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // Add highlight to food
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.arc(
        food.x * CELL_SIZE + CELL_SIZE / 2 - 3,
        food.y * CELL_SIZE + CELL_SIZE / 2 - 3,
        3,
        0,
        Math.PI * 2
    );
    ctx.fill();
}

// Generate food at random position
function generateFood() {
    do {
        food = {
            x: Math.floor(Math.random() * GRID_SIZE),
            y: Math.floor(Math.random() * GRID_SIZE)
        };
    } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
}

// Handle keyboard input
function handleKeyPress(e) {
    // Prevent default arrow key behavior (scrolling)
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
    
    switch (e.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            togglePause();
            break;
        case 'Escape':
            if (!gameOver.classList.contains('hidden')) {
                showModeSelection();
            }
            break;
    }
}

// Toggle pause
function togglePause() {
    isPaused = !isPaused;
    pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
}

// End game
function endGame() {
    clearInterval(gameLoop);
    
    // Update high score if needed
    if (score > highScores[currentMode]) {
        highScores[currentMode] = score;
        localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
    }
    
    // Show game over screen
    finalScoreElement.textContent = score;
    gameScreen.classList.add('hidden');
    gameOver.classList.remove('hidden');
}

// Show mode selection
function showModeSelection() {
    if (gameLoop) clearInterval(gameLoop);
    gameScreen.classList.add('hidden');
    gameOver.classList.add('hidden');
    modeSelection.classList.remove('hidden');
}

// Initialize when page loads
window.addEventListener('load', init);

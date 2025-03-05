const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const instructions = document.getElementById('instructions');

const tileSize = 50;
const mapWidth = 16; // Based on the graph paper grid
const mapHeight = 12;

// Stage 1 layout from the image (interpreted from the graph paper)
const stage1 = [
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    ['W', 'P1', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', 'D', 'W', 'W', 'W', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'C', 'W', ' ', 'W', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', 'P2', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W', ' ', 'W', 'W'],
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
];

// Symbols for the game
const symbols = {
    'W': '🧱', // Wall
    'P1': '😊👀', // Player 1: Smiley face with eyes
    'P2': '😊👨‍🦰👀', // Player 2: Smiley face with mustache and eyes
    'X': '😡👀', // Enemy: Mad face with eyes
    'D': '🚪', // Door
    'C': '📦', // Chest
    'K': '🔑' // Key
};

let player1 = { x: 1, y: 1, hasKey: false };
let player2 = { x: 1, y: 10, hasKey: false };
let enemies = [];
let currentStage = stage1;
let chestOpened = false;

function initializeEnemies() {
    enemies = [];
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            if (currentStage[y][x] === 'X') {
                enemies.push({ x, y });
            }
        }
    }
}

initializeEnemies();

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let y = 0; y < mapHeight; y++) {
        for (let x = 0; x < mapWidth; x++) {
            const tile = currentStage[y][x];
            ctx.fillStyle = 'black';
            ctx.font = '30px Arial';
            ctx.fillText(symbols[tile] || ' ', x * tileSize, y * tileSize + 30);
        }
    }
    // Draw players
    ctx.fillText(symbols['P1'], player1.x * tileSize, player1.y * tileSize + 30);
    ctx.fillText(symbols['P2'], player2.x * tileSize, player2.y * tileSize + 30);
    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillText(symbols['X'], enemy.x * tileSize, enemy.y * tileSize + 30);
    });
}

function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = Math.sign(player1.x - enemy.x + (player2.x - enemy.x)) || (Math.random() - 0.5);
        const dy = Math.sign(player1.y - enemy.y + (player2.y - enemy.y)) || (Math.random() - 0.5);
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        if (isValidMove(newX, newY)) {
            enemy.x = newX;
            enemy.y = newY;
        }
    });
}

function isValidMove(x, y) {
    return x >= 0 && x < mapWidth && y >= 0 && y < mapHeight && currentStage[y][x] !== 'W';
}

function movePlayer(player, dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    if (isValidMove(newX, newY)) {
        if (currentStage[newY][newX] === 'D') {
            // Transition to next room (simplified for Stage 1)
            currentStage = stage1; // Placeholder for now; you can expand to multiple stages
            player.x = 1; // Reset position to start of new room
            player.y = 1;
        } else if (currentStage[newY][newX] === 'C' && !chestOpened) {
            player.hasKey = true;
            chestOpened = true;
            currentStage[newY][newX] = 'K';
        } else if (currentStage[newY][newX] !== 'K') {
            player.x = newX;
            player.y = newY;
        }
    }
    checkCollisions();
}

function checkCollisions() {
    enemies.forEach((enemy, index) => {
        if ((enemy.x === player1.x && enemy.y === player1.y) || (enemy.x === player2.x && enemy.y === player2.y)) {
            // Simplified combat: remove enemy on collision (Diablo 2-like)
            enemies.splice(index, 1);
        }
    });
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w': movePlayer(player1, 0, -1); break;
        case 'a': movePlayer(player1, -1, 0); break;
        case 's': movePlayer(player1, 0, 1); break;
        case 'd': movePlayer(player1, 1, 0); break;
        case ' ': // Player 1 attack (simplified)
            enemies = enemies.filter(enemy => !(Math.abs(enemy.x - player1.x) <= 1 && Math.abs(enemy.y - player1.y) <= 1));
            break;
        case 'ArrowUp': movePlayer(player2, 0, -1); break;
        case 'ArrowLeft': movePlayer(player2, -1, 0); break;
        case 'ArrowDown': movePlayer(player2, 0, 1); break;
        case 'ArrowRight': movePlayer(player2, 1, 0); break;
        case 'h': instructions.style.display = instructions.style.display === 'none' ? 'block' : 'none'; break;
    }
    draw();
});

function gameLoop() {
    moveEnemies();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
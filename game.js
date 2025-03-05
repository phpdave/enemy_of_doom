const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const uiHealth = document.getElementById('playerHealth');
const uiEnemiesDefeated = document.getElementById('enemiesDefeated');
const uiKeyStatus = document.getElementById('keyStatus');

const tileSize = 40; // 20x15 grid fits in 800x600 canvas
const gridWidth = 20;
const gridHeight = 15;

// Updated dungeon layout to match 20x15 grid, based on the graph paper (scaled up)
const dungeonLayout = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], // Wall
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1], // Path
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1], // Wall/Path
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1] // Wall
];

// Game objects
const player = {
    x: 1, // Starting position (grid coordinates)
    y: 1,
    health: 100,
    speed: 4,
    color: 'blue'
};

const enemies = [
    { x: 6, y: 6, health: 50, isBoss: false, color: 'red' }, // Mini Boss
    { x: 18, y: 8, health: 100, isBoss: true, color: 'darkred' } // Stage One Boss
];

const chest = { x: 10, y: 7, hasKey: true, collected: false, color: 'yellow' };

let keysCollected = 0;
let enemiesDefeated = 0;
let gameOver = false;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dungeon
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            if (dungeonLayout[y] && dungeonLayout[y][x] === 1) { // Check if row exists
                ctx.fillStyle = '#666';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            } else if (dungeonLayout[y]) { // Ensure row exists
                ctx.fillStyle = '#444';
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }

    // Draw player
    if (player.x >= 0 && player.x < gridWidth && player.y >= 0 && player.y < gridHeight) {
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x * tileSize, player.y * tileSize, tileSize, tileSize);
    }

    // Draw enemies
    enemies.forEach(enemy => {
        if (enemy.health > 0 && enemy.x >= 0 && enemy.x < gridWidth && enemy.y >= 0 && enemy.y < gridHeight) {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x * tileSize, enemy.y * tileSize, tileSize, tileSize);
        }
    });

    // Draw chest
    if (!chest.collected && chest.x >= 0 && chest.x < gridWidth && chest.y >= 0 && chest.y < gridHeight) {
        ctx.fillStyle = chest.color;
        ctx.fillRect(chest.x * tileSize, chest.y * tileSize, tileSize, tileSize);
    }

    // Update UI
    uiHealth.textContent = player.health;
    uiEnemiesDefeated.textContent = enemiesDefeated;
    uiKeyStatus.textContent = chest.collected ? 'Yes' : 'No';
}

function movePlayer(dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;

    // Check boundaries and walls
    if (newX >= 0 && newX < gridWidth && newY >= 0 && newY < gridHeight) {
        if (dungeonLayout[newY] && dungeonLayout[newY][newX] === 0) { // Ensure row exists and is a path
            player.x = newX;
            player.y = newY;

            // Check for collisions with enemies
            enemies.forEach(enemy => {
                if (enemy.health > 0 && player.x === enemy.x && player.y === enemy.y) {
                    attackEnemy(enemy);
                }
            });

            // Check for chest
            if (player.x === chest.x && player.y === chest.y && !chest.collected) {
                chest.collected = true;
                keysCollected++;
                console.log('Key collected!');
            }
        }
    }
    draw();
}

function attackEnemy(enemy) {
    if (enemy.health > 0) {
        enemy.health -= 10; // Player deals 10 damage
        if (enemy.health <= 0) {
            enemiesDefeated++;
            if (enemy.isBoss) {
                console.log('Boss defeated! Stage cleared!');
                gameOver = true;
            }
        }
    }
}

function gameLoop() {
    if (!gameOver) {
        draw();
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (gameOver) return;

    switch (e.key) {
        case 'ArrowUp':
            movePlayer(0, -1);
            break;
        case 'ArrowDown':
            movePlayer(0, 1);
            break;
        case 'ArrowLeft':
            movePlayer(-1, 0);
            break;
        case 'ArrowRight':
            movePlayer(1, 0);
            break;
        case ' ':
            // Attack (check for nearby enemies)
            enemies.forEach(enemy => {
                if (Math.abs(player.x - enemy.x) <= 1 && Math.abs(player.y - enemy.y) <= 1 && enemy.health > 0) {
                    attackEnemy(enemy);
                }
            });
            break;
    }
});

gameLoop();
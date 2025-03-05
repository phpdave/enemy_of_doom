// game.js
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const instructions = document.getElementById('instructions');

const tileSize = 50; // Size of each grid square
const rows = 12; // Adjusted for margin
const cols = 16; // Adjusted for margin
canvas.width = cols * tileSize;
canvas.height = rows * tileSize;

// Dungeon layout for Stage 1 (based on the image)
const stage1 = [
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    ['W', 'P1', ' ', ' ', 'X', ' ', ' ', 'D', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'W'],
    ['W', ' ', ' ', ' ', ' ', ' ', 'X', ' ', 'X', ' ', ' ', ' ', 'MB', ' ', ' ', 'W'],
    ['W', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', 'W'],
    ['W', ' ', ' ', ' ', 'D', ' ', 'X', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', 'W'],
    ['W', ' ', 'X', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'K', ' ', 'W'],
    ['W', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'W'],
    ['W', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', 'BR', ' ', ' ', 'W'],
    ['W', ' ', 'X', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
    ['W', 'P2', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', 'W'],
    ['W', ' ', ' ', ' ', 'X', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
    ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
];

// Legend: W = Wall, P1 = Player 1, P2 = Player 2, X = Enemy, D = Door, MB = Mini-Boss, BR = Boss Room, K = Key Chest, ' ' = Floor

const players = [
    { x: 1, y: 1, speed: 5, color: 'yellow', isAttacking: false, attackCooldown: 0 }, // Player 1 (Smiley)
    { x: 1, y: 9, speed: 5, color: 'brown', isAttacking: false, attackCooldown: 0 }  // Player 2 (Mustache Smiley)
];

const enemies = [];
const miniBoss = { x: 12, y: 2, health: 50, speed: 2 }; // Mini-Boss position
const boss = { x: 12, y: 7, health: 100, speed: 1 }; // Boss position
let keyCollected = false;
let currentRoom = stage1;

function initEnemies() {
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (currentRoom[y][x] === 'X') {
                enemies.push({ x: x * tileSize, y: y * tileSize, health: 20, speed: 2 });
            }
        }
    }
}

initEnemies();

function drawSmiley(x, y, color, hasMustache = false) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + tileSize / 3, y + tileSize / 3, 5, 0, Math.PI * 2);
    ctx.arc(x + 2 * tileSize / 3, y + tileSize / 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + 2 * tileSize / 3, 10, 0, Math.PI);
    ctx.stroke();
    if (hasMustache) {
        ctx.strokeStyle = 'black';
        ctx.beginPath();
        ctx.moveTo(x + tileSize / 3, y + 2 * tileSize / 3);
        ctx.lineTo(x + tileSize / 2, y + tileSize / 2);
        ctx.moveTo(x + 2 * tileSize / 3, y + 2 * tileSize / 2);
        ctx.lineTo(x + tileSize / 2, y + tileSize / 2);
        ctx.stroke();
    }
}

function drawMadFace(x, y) {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(x + tileSize / 2, y + tileSize / 2, tileSize / 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'black';
    ctx.beginPath();
    ctx.arc(x + tileSize / 3, y + tileSize / 3, 5, 0, Math.PI * 2);
    ctx.arc(x + 2 * tileSize / 3, y + tileSize / 3, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x + tileSize / 3, y + 2 * tileSize / 3);
    ctx.lineTo(x + 2 * tileSize / 3, y + 2 * tileSize / 3);
    ctx.stroke();
}

function drawTile(x, y) {
    if (currentRoom[y][x] === 'W') {
        ctx.fillStyle = 'gray';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    } else if (currentRoom[y][x] === 'D') {
        ctx.fillStyle = 'brown';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    } else if (currentRoom[y][x] === 'K') {
        ctx.fillStyle = 'gold';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    } else if (currentRoom[y][x] === 'MB') {
        ctx.fillStyle = 'purple';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    } else if (currentRoom[y][x] === 'BR') {
        ctx.fillStyle = 'red';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw dungeon
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            drawTile(x, y);
        }
    }

    // Draw players
    players.forEach((player, index) => {
        drawSmiley(player.x, player.y, player.color, index === 1);
    });

    // Draw enemies
    enemies.forEach(enemy => {
        drawMadFace(enemy.x, enemy.y);
    });

    // Draw mini-boss
    drawMadFace(miniBoss.x * tileSize, miniBoss.y * tileSize);

    // Draw boss
    drawMadFace(boss.x * tileSize, boss.y * tileSize);

    // Draw key chest if not collected
    if (!keyCollected && currentRoom.some(row => row.includes('K'))) {
        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                if (currentRoom[y][x] === 'K') {
                    ctx.fillStyle = 'gold';
                    ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
                }
            }
        }
    }

    requestAnimationFrame(draw);
}

function movePlayer(player, dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    const gridX = Math.floor(newX / tileSize);
    const gridY = Math.floor(newY / tileSize);

    if (currentRoom[gridY] && currentRoom[gridY][gridX] !== 'W') {
        if (currentRoom[gridY][gridX] === 'D') {
            changeRoom(gridX, gridY);
        } else if (currentRoom[gridY][gridX] === 'K') {
            keyCollected = true;
            currentRoom[gridY][gridX] = ' ';
        }
        player.x = newX;
        player.y = newY;
    }
}

function changeRoom(x, y) {
    // Simple room change logic (could expand for multiple rooms)
    if (y === 1 && x === 7) { // Example: Door at (7,1) leads to Boss Room
        currentRoom = [
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', 'D', ' ', ' ', ' ', ' ', 'BR', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'W'],
            ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W']
        ];
        players[0].x = 1 * tileSize;
        players[0].y = 1 * tileSize;
        players[1].x = 1 * tileSize;
        players[1].y = 9 * tileSize;
        enemies.length = 0;
        initEnemies();
    }
}

function moveEnemies() {
    enemies.forEach(enemy => {
        const dx = (players[0].x + players[1].x) / 2 - enemy.x > 0 ? enemy.speed : -enemy.speed;
        const dy = (players[0].y + players[1].y) / 2 - enemy.y > 0 ? enemy.speed : -enemy.speed;
        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        const gridX = Math.floor(newX / tileSize);
        const gridY = Math.floor(newY / tileSize);

        if (currentRoom[gridY] && currentRoom[gridY][gridX] !== 'W') {
            enemy.x = newX;
            enemy.y = newY;
        }
    });

    // Move mini-boss towards players
    const dxMB = (players[0].x + players[1].x) / 2 - miniBoss.x * tileSize > 0 ? miniBoss.speed : -miniBoss.speed;
    const dyMB = (players[0].y + players[1].y) / 2 - miniBoss.y * tileSize > 0 ? miniBoss.speed : -miniBoss.speed;
    miniBoss.x += dxMB > 0 ? 1 : -1;
    miniBoss.y += dyMB > 0 ? 1 : -1;

    // Move boss towards players
    const dxB = (players[0].x + players[1].x) / 2 - boss.x * tileSize > 0 ? boss.speed : -boss.speed;
    const dyB = (players[0].y + players[1].y) / 2 - boss.y * tileSize > 0 ? boss.speed : -boss.speed;
    boss.x += dxB > 0 ? 1 : -1;
    boss.y += dyB > 0 ? 1 : -1;
}

function attack(playerIndex) {
    if (players[playerIndex].attackCooldown > 0) return;
    players[playerIndex].isAttacking = true;
    players[playerIndex].attackCooldown = 30; // Cooldown in frames

    // Sword swing animation
    const swing = () => {
        ctx.save();
        ctx.translate(players[playerIndex].x + tileSize / 2, players[playerIndex].y + tileSize / 2);
        ctx.rotate(Math.PI / 4);
        ctx.fillStyle = 'silver';
        ctx.fillRect(-10, -tileSize / 2, 20, tileSize);
        ctx.restore();

        // Damage text above nearest enemy
        enemies.forEach((enemy, i) => {
            const dist = Math.hypot(enemy.x - players[playerIndex].x, enemy.y - players[playerIndex].y);
            if (dist < tileSize * 2) { // Within attack range
                enemy.health -= 10;
                ctx.fillStyle = 'red';
                ctx.font = '20px Arial';
                ctx.fillText('-10', enemy.x, enemy.y - 10);
                if (enemy.health <= 0) enemies.splice(i, 1);
            }
        });

        if (Math.hypot(miniBoss.x * tileSize - players[playerIndex].x, miniBoss.y * tileSize - players[playerIndex].y) < tileSize * 2) {
            miniBoss.health -= 10;
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText('-10', miniBoss.x * tileSize, miniBoss.y * tileSize - 10);
            if (miniBoss.health <= 0) miniBoss.health = 0; // Mini-boss defeated
        }

        if (Math.hypot(boss.x * tileSize - players[playerIndex].x, boss.y * tileSize - players[playerIndex].y) < tileSize * 2) {
            boss.health -= 10;
            ctx.fillStyle = 'red';
            ctx.font = '20px Arial';
            ctx.fillText('-10', boss.x * tileSize, boss.y * tileSize - 10);
            if (boss.health <= 0) boss.health = 0; // Boss defeated
        }
    };

    swing();
    setTimeout(() => players[playerIndex].isAttacking = false, 200);
}

document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'ArrowUp': movePlayer(players[0], 0, -players[0].speed); break;
        case 'ArrowDown': movePlayer(players[0], 0, players[0].speed); break;
        case 'ArrowLeft': movePlayer(players[0], -players[0].speed, 0); break;
        case 'ArrowRight': movePlayer(players[0], players[0].speed, 0); break;
        case 'w': movePlayer(players[1], 0, -players[1].speed); break;
        case 's': movePlayer(players[1], 0, players[1].speed); break;
        case 'a': movePlayer(players[1], -players[1].speed, 0); break;
        case 'd': movePlayer(players[1], players[1].speed, 0); break;
        case ' ': attack(0); break; // Player 1 attack
        case 'e': attack(1); break; // Player 2 attack
        case 'h': instructions.classList.toggle('hidden'); break; // Hide/show instructions
    }
});

function gameLoop() {
    moveEnemies();
    if (players[0].attackCooldown > 0) players[0].attackCooldown--;
    if (players[1].attackCooldown > 0) players[1].attackCooldown--;
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
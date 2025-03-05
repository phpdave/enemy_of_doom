const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const instructions = document.getElementById('instructions');

const GRID_SIZE = 50; // 10x10 grid, each cell 50x50 pixels
const MAP_SIZE = 10;

const player1 = { x: 1, y: 9, sprite: '😊', color: '#00ff00' }; // Smiley face for Player 1
const player2 = { x: 9, y: 9, sprite: '😸', color: '#ff00ff' }; // Mustache smiley for Player 2
const enemies = []; // Will store enemy positions (mad faces: 😡)
const miniBoss = { x: 5, y: 5, sprite: '👹', hp: 50 }; // Mini boss
const boss = { x: 9, y: 1, sprite: '💀', hp: 100 }; // Boss
let chest = { x: 2, y: 5, hasKey: true, sprite: '📦' }; // Chest with key
let hasKey = false;
let currentRoom = 'main'; // Track current room

// Room layouts (simplified for Stage 1)
const rooms = {
    main: [
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', '📦', ' ', '👹', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        ['😊', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '😸'],
        [' ', '🚪', ' ', ' ', ' ', ' ', ' ', '🚪', ' ', ' ']
    ],
    bossRoom: [
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '💀', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '🚪', ' ']
    ]
};

// Initialize enemies (Xs from image, mad faces)
function initEnemies() {
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            if (rooms.main[y][x] === 'X') {
                enemies.push({ x, y, sprite: '😡', hp: 20 });
            }
        }
    }
}
initEnemies();

// Draw the game
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const room = rooms[currentRoom];
    for (let y = 0; y < MAP_SIZE; y++) {
        for (let x = 0; x < MAP_SIZE; x++) {
            const cell = room[y][x];
            ctx.fillStyle = '#666';
            ctx.fillRect(x * GRID_SIZE, y * GRID_SIZE, GRID_SIZE, GRID_SIZE);
            ctx.fillStyle = '#fff';
            if (cell === '😊' || cell === '😸' || cell === '😡' || cell === '👹' || cell === '💀' || cell === '📦' || cell === '🚪') {
                ctx.fillText(cell, x * GRID_SIZE + GRID_SIZE / 2, y * GRID_SIZE + GRID_SIZE / 2);
            }
        }
    }

    // Draw players
    ctx.fillStyle = player1.color;
    ctx.fillText(player1.sprite, player1.x * GRID_SIZE + GRID_SIZE / 2, player1.y * GRID_SIZE + GRID_SIZE / 2);
    ctx.fillStyle = player2.color;
    ctx.fillText(player2.sprite, player2.x * GRID_SIZE + GRID_SIZE / 2, player2.y * GRID_SIZE + GRID_SIZE / 2);

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = '#ff0000';
        ctx.fillText(enemy.sprite, enemy.x * GRID_SIZE + GRID_SIZE / 2, enemy.y * GRID_SIZE + GRID_SIZE / 2);
    });

    // Draw mini boss and boss
    ctx.fillStyle = '#ff8000';
    ctx.fillText(miniBoss.sprite, miniBoss.x * GRID_SIZE + GRID_SIZE / 2, miniBoss.y * GRID_SIZE + GRID_SIZE / 2);
    ctx.fillStyle = '#000000';
    ctx.fillText(boss.sprite, boss.x * GRID_SIZE + GRID_SIZE / 2, boss.y * GRID_SIZE + GRID_SIZE / 2);

    // Draw chest
    if (chest.hasKey) {
        ctx.fillStyle = '#ffd700';
        ctx.fillText(chest.sprite, chest.x * GRID_SIZE + GRID_SIZE / 2, chest.y * GRID_SIZE + GRID_SIZE / 2);
    }
}

// Move players
function movePlayer(player, dx, dy) {
    const newX = player.x + dx;
    const newY = player.y + dy;
    const room = rooms[currentRoom];

    if (newX >= 0 && newX < MAP_SIZE && newY >= 0 && newY < MAP_SIZE) {
        if (room[newY][newX] !== ' ') {
            // Check for doors
            if (room[newY][newX] === '🚪') {
                if (currentRoom === 'main' && (newX === 1 || newX === 8)) {
                    currentRoom = 'bossRoom';
                    if (newX === 1) player.x = 9; // Enter boss room from left door
                    else player.x = 0; // Enter boss room from right door
                    player.y = 9;
                    return;
                } else if (currentRoom === 'bossRoom' && newX === 9) {
                    currentRoom = 'main';
                    player.x = 1; // Return to main room
                    player.y = 9;
                    return;
                }
            }
            // Check for chest
            if (room[newY][newX] === '📦' && chest.hasKey) {
                hasKey = true;
                chest.hasKey = false;
                room[newY][newX] = ' ';
            }
            // Check for enemies, mini boss, or boss
            enemies.forEach((enemy, index) => {
                if (enemy.x === newX && enemy.y === newY) {
                    attack(player, enemy);
                    if (enemy.hp <= 0) enemies.splice(index, 1);
                }
            });
            if (miniBoss.x === newX && miniBoss.y === newY && miniBoss.hp > 0) {
                attack(player, miniBoss);
            }
            if (boss.x === newX && boss.y === newY && boss.hp > 0) {
                attack(player, boss);
            }
        } else {
            player.x = newX;
            player.y = newY;
            room[player.y][player.x] = player.sprite;
            room[player.y - dy][player.x - dx] = ' ';
        }
    }
    draw();
}

// Attack function (Diablo 2-inspired, simple damage)
function attack(attacker, target) {
    const damage = Math.floor(Math.random() * 10) + 5; // Random damage 5-15
    target.hp -= damage;
    console.log(`${attacker.sprite} deals ${damage} damage to ${target.sprite}. ${target.sprite} HP: ${target.hp}`);
    if (target.hp <= 0) {
        console.log(`${target.sprite} defeated!`);
        if (target === miniBoss || target === boss) {
            rooms[currentRoom][target.y][target.x] = ' ';
        }
    }
}

// Enemy AI (simple movement toward nearest player)
function moveEnemies() {
    enemies.forEach(enemy => {
        const dx1 = player1.x - enemy.x;
        const dy1 = player1.y - enemy.y;
        const dx2 = player2.x - enemy.x;
        const dy2 = player2.y - enemy.y;

        let dx = 0, dy = 0;
        if (Math.abs(dx1) + Math.abs(dy1) < Math.abs(dx2) + Math.abs(dy2)) {
            dx = Math.sign(dx1);
            dy = Math.sign(dy1);
        } else {
            dx = Math.sign(dx2);
            dy = Math.sign(dy2);
        }

        const newX = enemy.x + dx;
        const newY = enemy.y + dy;
        if (newX >= 0 && newX < MAP_SIZE && newY >= 0 && newY < MAP_SIZE && rooms[currentRoom][newY][newX] === ' ') {
            rooms[currentRoom][enemy.y][enemy.x] = ' ';
            enemy.x = newX;
            enemy.y = newY;
            rooms[currentRoom][enemy.y][enemy.x] = '😡';
        }
    });
    draw();
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w': movePlayer(player1, 0, -1); break; // Player 1 up
        case 's': movePlayer(player1, 0, 1); break;  // Player 1 down
        case 'a': movePlayer(player1, -1, 0); break; // Player 1 left
        case 'd': movePlayer(player1, 1, 0); break;  // Player 1 right
        case 'q': // Player 1 attack (nearest enemy, mini boss, or boss)
            let target1 = enemies.find(e => Math.abs(e.x - player1.x) <= 1 && Math.abs(e.y - player1.y) <= 1);
            if (!target1 && Math.abs(miniBoss.x - player1.x) <= 1 && Math.abs(miniBoss.y - player1.y) <= 1) target1 = miniBoss;
            if (!target1 && Math.abs(boss.x - player1.x) <= 1 && Math.abs(boss.y - player1.y) <= 1) target1 = boss;
            if (target1) attack(player1, target1);
            break;
        case 'ArrowUp': movePlayer(player2, 0, -1); break;    // Player 2 up
        case 'ArrowDown': movePlayer(player2, 0, 1); break;   // Player 2 down
        case 'ArrowLeft': movePlayer(player2, -1, 0); break;  // Player 2 left
        case 'ArrowRight': movePlayer(player2, 1, 0); break;  // Player 2 right
        case 'p': // Player 2 attack
            let target2 = enemies.find(e => Math.abs(e.x - player2.x) <= 1 && Math.abs(e.y - player2.y) <= 1);
            if (!target2 && Math.abs(miniBoss.x - player2.x) <= 1 && Math.abs(miniBoss.y - player2.y) <= 1) target2 = miniBoss;
            if (!target2 && Math.abs(boss.x - player2.x) <= 1 && Math.abs(boss.y - player2.y) <= 1) target2 = boss;
            if (target2) attack(player2, target2);
            break;
        case 'h': // Hide/show instructions
            instructions.classList.toggle('hidden');
            break;
    }
    moveEnemies(); // Enemies move after player actions
});

// Start the game
draw();
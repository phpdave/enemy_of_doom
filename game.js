const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    parent: 'game-container'
};

const game = new Phaser.Game(config);
let player1, player2, enemies, doors, chests, miniBoss, boss, keyItem;
let currentRoom = 'startRoom';
let helpTextVisible = true;

function preload() {
    // Load images for players, enemies, doors, chests, etc.
    this.load.image('smiley', 'https://via.placeholder.com/32/FFFF00/000000?text=😊'); // Player 1
    this.load.image('mustacheSmiley', 'https://via.placeholder.com/32/FFFF00/000000?text=😊 mustache'); // Player 2
    this.load.image('madFace', 'https://via.placeholder.com/32/FF0000/000000?text=😡'); // Enemies
    this.load.image('door', 'https://via.placeholder.com/32/808080/000000?text=🚪'); // Doors
    this.load.image('chest', 'https://via.placeholder.com/32/FFD700/000000?text=📦'); // Chest
    this.load.image('miniBoss', 'https://via.placeholder.com/32/FF4500/000000?text=👹'); // Mini Boss
    this.load.image('boss', 'https://via.placeholder.com/32/FF0000/000000?text=👿'); // Boss
    this.load.image('key', 'https://via.placeholder.com/32/00FF00/000000?text=🔑'); // Key
    this.load.image('sword', 'https://via.placeholder.com/32/FFFFFF/000000?text=⚔️'); // Sword animation
}

function create() {
    // Create the map based on the image (Stage 1 layout)
    const tileSize = 32;
    const map = this.make.tilemap({ data: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    ], tileWidth: tileSize, tileHeight: tileSize });
    const tileset = map.addTilesetImage('tiles');
    const layer = map.createLayer(0, tileset, 0, 0);

    // Create players
    player1 = this.physics.add.sprite(100, 100, 'smiley').setScale(1);
    player2 = this.physics.add.sprite(150, 100, 'mustacheSmiley').setScale(1);

    // Create enemies (Xs on the map)
    enemies = this.physics.add.group();
    // Place enemies based on the image (approximate positions for Xs)
    const enemyPositions = [
        { x: 200, y: 200 },
        { x: 300, y: 300 },
        { x: 400, y: 200 }
    ];
    enemyPositions.forEach(pos => {
        enemies.create(pos.x, pos.y, 'madFace').setScale(1);
    });

    // Create doors (based on the image, e.g., "tricked door" and "door" symbols)
    doors = this.physics.add.group();
    doors.create(600, 300, 'door').setScale(1); // Example door position

    // Create chest with key
    chests = this.physics.add.group();
    chests.create(500, 400, 'chest').setScale(1);
    keyItem = this.physics.add.sprite(500, 400, 'key').setScale(1).setVisible(false);

    // Create mini boss and boss
    miniBoss = this.physics.add.sprite(700, 200, 'miniBoss').setScale(1);
    boss = this.physics.add.sprite(750, 250, 'boss').setScale(1);

    // Set up collisions
    this.physics.add.overlap(player1, doors, changeRoom, null, this);
    this.physics.add.overlap(player2, doors, changeRoom, null, this);
    this.physics.add.overlap(player1, chests, collectKey, null, this);
    this.physics.add.overlap(player2, chests, collectKey, null, this);
    this.physics.add.overlap([player1, player2], enemies, attackEnemy, null, this);

    // Keyboard controls
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = {
        w: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        a: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        s: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        d: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        space: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        q: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        h: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.H)
    };

    // Help text
    this.helpText = document.getElementById('help-text');
    if (this.keys.h.isDown) {
        this.helpText.classList.toggle('hidden');
        helpTextVisible = !helpTextVisible;
    }
}

function update() {
    // Player 1 movement (Arrow Keys)
    player1.setVelocity(0);
    if (this.cursors.left.isDown) player1.setVelocityX(-200);
    if (this.cursors.right.isDown) player1.setVelocityX(200);
    if (this.cursors.up.isDown) player1.setVelocityY(-200);
    if (this.cursors.down.isDown) player1.setVelocityY(200);

    // Player 2 movement (WASD)
    player2.setVelocity(0);
    if (this.keys.w.isDown) player2.setVelocityY(-200);
    if (this.keys.s.isDown) player2.setVelocityY(200);
    if (this.keys.a.isDown) player2.setVelocityX(-200);
    if (this.keys.d.isDown) player2.setVelocityX(200);

    // Enemy movement (simple AI, move towards players)
    enemies.getChildren().forEach(enemy => {
        this.physics.moveToObject(enemy, player1, 100);
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, player1.x, player1.y) < 50) {
            attackPlayer(enemy, player1);
        }
        this.physics.moveToObject(enemy, player2, 100);
        if (Phaser.Math.Distance.Between(enemy.x, enemy.y, player2.x, player2.y) < 50) {
            attackPlayer(enemy, player2);
        }
    });

    // Hide help text with H key
    if (Phaser.Input.Keyboard.JustDown(this.keys.h)) {
        this.helpText.classList.toggle('hidden');
        helpTextVisible = !helpTextVisible;
    }

    // Attack with Spacebar (Player 1) or Q (Player 2)
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) attack(player1);
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) attack(player2);
}

function changeRoom(player, door) {
    // Transition to a new room (simplified for now)
    currentRoom = 'bossRoom'; // Example room change
    this.scene.restart(); // Restart scene with new room layout
}

function collectKey(player, chest) {
    keyItem.setVisible(true);
    chest.destroy();
}

function attack(player) {
    // Create sword swing animation
    const sword = this.physics.add.sprite(player.x, player.y, 'sword').setScale(1);
    this.tweens.add({
        targets: sword,
        angle: 360,
        duration: 300,
        onComplete: () => sword.destroy()
    });

    // Check for nearby enemies and deal damage
    enemies.getChildren().forEach(enemy => {
        if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 50) {
            enemy.health = (enemy.health || 100) - 20; // Simple damage
            if (enemy.health <= 0) enemy.destroy();
            
            // Show damage text
            const damageText = this.add.text(enemy.x, enemy.y - 20, '-20', {
                fontSize: '16px',
                fill: '#FF0000'
            });
            this.tweens.add({
                targets: damageText,
                y: damageText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => damageText.destroy()
            });
        }
    });
}

function attackPlayer(enemy, player) {
    // Simple enemy attack (reduce player health, not fully implemented for brevity)
    player.health = (player.health || 100) - 10;
    if (player.health <= 0) player.destroy();
}
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
    // Remove any existing textures to avoid conflicts
    this.textures.remove('smiley');
    this.textures.remove('mustacheSmiley');
    this.textures.remove('madFace');
    this.textures.remove('door');
    this.textures.remove('chest');
    this.textures.remove('miniBoss');
    this.textures.remove('boss');
    this.textures.remove('key');
    this.textures.remove('sword');
    this.textures.remove('tiles'); // Remove tiles texture if not used

    // Create all assets programmatically using Phaser Graphics
    createAssets(this);
}

function createAssets(scene) {
    const tileSize = 32;
    const graphics = scene.add.graphics();

    // Smiley (Player 1) - Yellow circle with black eyes and smile
    graphics.clear();
    graphics.fillStyle(0xffff00, 1); // Yellow
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 2);
    graphics.fillStyle(0x000000, 1); // Black
    graphics.fillCircle(tileSize / 4, tileSize / 3, 2); // Left eye
    graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 2); // Right eye
    // Use arc for a smile
    graphics.beginPath();
    graphics.arc(tileSize / 2, 2 * tileSize / 3, tileSize / 4, Math.PI, 0, true);
    graphics.strokePath();
    graphics.generateTexture('smiley', tileSize, tileSize);
    graphics.clear();

    // Mustache Smiley (Player 2) - Yellow circle with black eyes, smile, and mustache
    graphics.fillStyle(0xffff00, 1); // Yellow
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 2);
    graphics.fillStyle(0x000000, 1); // Black
    graphics.fillCircle(tileSize / 4, tileSize / 3, 2); // Left eye
    graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 2); // Right eye
    // Use arc for a smile
    graphics.beginPath();
    graphics.arc(tileSize / 2, 2 * tileSize / 3, tileSize / 4, Math.PI, 0, true);
    graphics.strokePath();
    // Mustache (simple curved lines using lineTo)
    graphics.lineStyle(2, 0x000000);
    graphics.beginPath();
    graphics.moveTo(tileSize / 4, 4 * tileSize / 5);
    graphics.lineTo(tileSize / 2 - 4, 4 * tileSize / 5 + 4);
    graphics.lineTo(tileSize / 2 + 4, 4 * tileSize / 5 + 4);
    graphics.lineTo(3 * tileSize / 4, 4 * tileSize / 5);
    graphics.strokePath();
    graphics.generateTexture('mustacheSmiley', tileSize, tileSize);
    graphics.clear();

    // Mad Face (Enemy) - Red circle with angry eyes and frown
    graphics.fillStyle(0xff0000, 1); // Red
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 2);
    graphics.fillStyle(0x000000, 1); // Black
    graphics.fillCircle(tileSize / 4, tileSize / 3, 2); // Left eye
    graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 2); // Right eye
    // Use arc for a frown
    graphics.beginPath();
    graphics.arc(tileSize / 2, 2 * tileSize / 3, tileSize / 4, 0, Math.PI, false);
    graphics.strokePath();
    graphics.generateTexture('madFace', tileSize, tileSize);
    graphics.clear();

    // Door - Gray rectangle with a handle
    graphics.fillStyle(0x808080, 1); // Gray
    graphics.fillRect(2, 2, tileSize - 4, tileSize - 4);
    graphics.fillStyle(0x000000, 1); // Black handle
    graphics.fillCircle(tileSize / 4, tileSize / 2, 3);
    graphics.generateTexture('door', tileSize, tileSize);
    graphics.clear();

    // Chest - Gold rectangle with a lid
    graphics.fillStyle(0xffd700, 1); // Gold
    graphics.fillRect(2, 2, tileSize - 4, tileSize - 4);
    graphics.lineStyle(2, 0x000000); // Black outline for lid
    graphics.beginPath();
    graphics.moveTo(2, tileSize / 2);
    graphics.lineTo(tileSize / 2, tileSize / 4);
    graphics.lineTo(tileSize - 2, tileSize / 2);
    graphics.strokePath();
    graphics.generateTexture('chest', tileSize, tileSize);
    graphics.clear();

    // Mini Boss - Red circle with horns
    graphics.fillStyle(0xff4500, 1); // Orange-red
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 2);
    graphics.lineStyle(2, 0x000000); // Black horns
    graphics.beginPath();
    graphics.moveTo(tileSize / 3, tileSize / 4);
    graphics.lineTo(tileSize / 4, tileSize / 6);
    graphics.moveTo(2 * tileSize / 3, tileSize / 4);
    graphics.lineTo(3 * tileSize / 4, tileSize / 6);
    graphics.strokePath();
    graphics.generateTexture('miniBoss', tileSize, tileSize);
    graphics.clear();

    // Boss - Dark red circle with horns and spikes
    graphics.fillStyle(0x8b0000, 1); // Dark red
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 2);
    graphics.lineStyle(2, 0xffff00); // Yellow horns and spikes
    graphics.beginPath();
    graphics.moveTo(tileSize / 3, tileSize / 4);
    graphics.lineTo(tileSize / 4, tileSize / 6);
    graphics.moveTo(2 * tileSize / 3, tileSize / 4);
    graphics.lineTo(3 * tileSize / 4, tileSize / 6);
    // Add simple spikes
    graphics.moveTo(tileSize / 2, 2);
    graphics.lineTo(tileSize / 2 - 4, 8);
    graphics.moveTo(tileSize / 2, 2);
    graphics.lineTo(tileSize / 2 + 4, 8);
    graphics.strokePath();
    graphics.generateTexture('boss', tileSize, tileSize);
    graphics.clear();

    // Key - Green key shape
    graphics.fillStyle(0x00ff00, 1); // Green
    graphics.fillRect(tileSize / 4, tileSize / 4, tileSize / 2, 2); // Shaft
    graphics.fillCircle(tileSize / 2, tileSize / 4, 4); // Head of key
    graphics.generateTexture('key', tileSize, tileSize);
    graphics.clear();

    // Sword - White sword shape
    graphics.fillStyle(0xffffff, 1); // White
    graphics.fillRect(tileSize / 2 - 2, 2, 4, tileSize / 2); // Blade
    graphics.fillRect(tileSize / 2 - 6, tileSize / 2, 12, 4); // Crossguard
    graphics.fillRect(tileSize / 2 - 2, tileSize / 2 + 4, 4, tileSize / 4); // Handle
    graphics.generateTexture('sword', tileSize, tileSize);
    graphics.clear();

    // Optional: Create a simple tileset texture if needed (e.g., black square for tiles)
    graphics.fillStyle(0x000000, 1); // Black
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('tiles', tileSize, tileSize);
    graphics.clear();
}

function create() {
    // Create the map (remove tileset if not needed, or use the generated 'tiles' texture)
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
    // Remove or comment out the tileset if not needed
    // const tileset = map.addTilesetImage('tiles');
    // const layer = map.createLayer(0, tileset, 0, 0);

    // Create players
    player1 = this.physics.add.sprite(100, 100, 'smiley').setScale(1);
    player2 = this.physics.add.sprite(150, 100, 'mustacheSmiley').setScale(1);

    // Create enemies (Xs on the map)
    enemies = this.physics.add.group();
    const enemyPositions = [
        { x: 200, y: 200 },
        { x: 300, y: 300 },
        { x: 400, y: 200 }
    ];
    enemyPositions.forEach(pos => {
        const enemy = enemies.create(pos.x, pos.y, 'madFace').setScale(1);
        enemy.health = 100; // Initialize enemy health
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
    if (Phaser.Input.Keyboard.JustDown(this.keys.space)) attack.call(this, player1); // Use .call to bind the scene context
    if (Phaser.Input.Keyboard.JustDown(this.keys.q)) attack.call(this, player2); // Use .call to bind the scene context
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
    // Ensure 'this' refers to the Phaser scene
    const scene = this; // Capture the scene context
    // Create sword swing animation
    const sword = scene.physics.add.sprite(player.x, player.y, 'sword').setScale(1);
    scene.tweens.add({
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
            const damageText = scene.add.text(enemy.x, enemy.y - 20, '-20', {
                fontSize: '16px',
                fill: '#FF0000'
            });
            scene.tweens.add({
                targets: damageText,
                y: damageText.y - 30,
                alpha: 0,
                duration: 1000,
                onComplete: () => damageText.destroy()
            });
        }
    });
}

function attackEnemy(player, enemy) {
    // This function is called when a player overlaps with an enemy
    // Trigger the attack with the correct scene context
    attack.call(this, player); // Use .call to bind the scene context
}

function attackPlayer(enemy, player) {
    // Simple enemy attack (reduce player health, not fully implemented for brevity)
    player.health = (player.health || 100) - 10;
    if (player.health <= 0) player.destroy();
}
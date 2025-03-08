// Define the SplashScene
class SplashScene extends Phaser.Scene {
    constructor() {
        super('SplashScene');
    }

    preload() {
        // Load the splash image
        this.load.image('splash', 'enemy_of_doom_splash.jpg');
    }

    create() {
        // Display the splash image centered on the 800x600 canvas
        this.add.image(400, 300, 'splash').setOrigin(0.5);
        // Wait 3 seconds, then start the MyGame scene
        this.time.delayedCall(3000, () => {
            this.scene.start('MyGame');
        }, [], this);
    }
}

class MyGame extends Phaser.Scene {
    constructor() {
        super('MyGame');
    }

    preload() {
        createAssets(this);
        this.load.audio('backgroundMusic', 'assets/backgroundMusic.mp3');
    }

    create() {
        const tileSize = 64;

        this.gameStarted = false;

        player1 = this.physics.add.sprite(400, 300, 'smiley').setScale(1);
        player1.health = 100;
        player1.setCollideWorldBounds(true); // Prevent player1 from leaving the canvas

        player2 = this.physics.add.sprite(450, 300, 'mustacheSmiley').setScale(1);
        player2.health = 100;
        player2.setCollideWorldBounds(true); // Prevent player2 from leaving the canvas

        enemies = this.physics.add.group();
        const enemyPositions = [
            { x: 300, y: 200 },
            { x: 500, y: 400 },
            { x: 600, y: 250 }
        ];
        enemyPositions.forEach(pos => {
            const enemy = enemies.create(pos.x, pos.y, 'madFace').setScale(1);
            enemy.health = 40;
            enemy.setVelocity(0);
            enemy.setCollideWorldBounds(true); // Already set to prevent enemies from leaving
            this.time.addEvent({
                delay: 2000,
                callback: () => {
                    if (enemy && enemy.active) {
                        const angle = Phaser.Math.Between(0, 360);
                        const speed = 100;
                        enemy.setVelocity(
                            Math.cos(angle * Math.PI / 180) * speed,
                            Math.sin(angle * Math.PI / 180) * speed
                        );
                    }
                },
                loop: true
            });
        });

        doors = this.physics.add.group();
        doors.create(700, 300, 'door').setScale(1);

        chests = this.physics.add.group();
        chests.create(350, 400, 'chest').setScale(1);
        keyItem = this.physics.add.sprite(350, 400, 'key').setScale(1).setVisible(false);

        miniBoss = this.physics.add.sprite(650, 200, 'miniBoss').setScale(1);
        boss = this.physics.add.sprite(700, 250, 'boss').setScale(1);

        this.physics.add.overlap(player1, doors, this.changeRoom, null, this);
        this.physics.add.overlap(player2, doors, this.changeRoom, null, this);
        this.physics.add.overlap(player1, chests, this.collectKey, null, this);
        this.physics.add.overlap(player2, chests, this.collectKey, null, this);

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

        this.helpText = document.getElementById('help-text');

        this.countdownBg = this.add.rectangle(400, 30, 800, 60, 0xff0000, 0.7);
        this.countdownBg.setOrigin(0.5, 0.5);
        this.countdownBg.setDepth(100);

        this.countdownText = this.add.text(400, 30, 'Game starts in 5', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial Black',
            stroke: '#ff4500',
            strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5, 0.5).setDepth(101);

        this.scene.startTime = this.time.now;

        this.time.delayedCall(5000, this.startGame, [], this);

        try {
            music = this.sound.get('backgroundMusic');
        } catch (error) {
            console.error('Failed to load background music:', error);
            this.add.text(400, 550, 'Background music failed to load.', {
                fontSize: '16px',
                fill: '#ffffff',
                align: 'center'
            }).setOrigin(0.5);
        }

        this.input.once('pointerdown', () => {
            if (music && !music.isPlaying) {
                music.play({ loop: true, volume: 0.5 });
            }
        }, this);

        this.input.keyboard.once('keydown', () => {
            if (music && !music.isPlaying) {
                music.play({ loop: true, volume: 0.5 });
            }
        }, this);
    }

    update() {
        if (!this.gameStarted) {
            const elapsedTime = this.time.now - this.scene.startTime;
            const remainingTime = Math.max(0, 5 - (elapsedTime / 1000));
            if (this.countdownText && remainingTime > 0) {
                this.countdownText.setText(`Game starts in ${remainingTime.toFixed(1)}`);
            }

            if (this.cursors.left.isDown || this.cursors.right.isDown || 
                this.cursors.up.isDown || this.cursors.down.isDown ||
                this.keys.w.isDown || this.keys.s.isDown || 
                this.keys.a.isDown || this.keys.d.isDown) {
                this.startGame();
            }
            return;
        }

        // Player 1 movement
        if (player1 && player1.active) {
            player1.setVelocity(0);
            if (this.cursors.left.isDown) player1.setVelocityX(-200);
            if (this.cursors.right.isDown) player1.setVelocityX(200);
            if (this.cursors.up.isDown) player1.setVelocityY(-200);
            if (this.cursors.down.isDown) player1.setVelocityY(200);
        }

        // Player 2 movement
        if (player2 && player2.active) {
            player2.setVelocity(0);
            if (this.keys.w.isDown) player2.setVelocityY(-200);
            if (this.keys.s.isDown) player2.setVelocityY(200);
            if (this.keys.a.isDown) player2.setVelocityX(-200);
            if (this.keys.d.isDown) player2.setVelocityX(200);
        }

        // Enemy attack logic
        enemies.getChildren().forEach(enemy => {
            if (player1 && player1.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, player1.x, player1.y) < 20) {
                this.attackPlayer(enemy, player1);
            }
            if (player2 && player2.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, player2.x, player2.y) < 20) {
                this.attackPlayer(enemy, player2);
            }
        });

        // Player attacks
        if (player1 && player1.active && Phaser.Input.Keyboard.JustDown(this.keys.space)) this.attack(player1);
        if (player2 && player2.active && Phaser.Input.Keyboard.JustDown(this.keys.q)) this.attack(player2);

        // Toggle help text
        if (Phaser.Input.Keyboard.JustDown(this.keys.h)) {
            this.helpText.classList.toggle('hidden');
            helpTextVisible = !helpTextVisible;
        }
    }

    startGame() {
        this.gameStarted = true;
        if (this.countdownText) {
            this.countdownText.destroy();
        }
        if (this.countdownBg) {
            this.countdownBg.destroy();
        }
    }

    changeRoom(player, door) {
        if (!this.gameStarted) return;
        currentRoom = 'bossRoom';
        this.scene.restart();
    }

    collectKey(player, chest) {
        if (!this.gameStarted) return;
        keyItem.setVisible(true);
        chest.destroy();
    }

    attack(player) {
        if (!this.gameStarted) return;
        const scene = this;
        const sword = scene.physics.add.sprite(player.x, player.y, 'sword').setScale(1);
        scene.tweens.add({
            targets: sword,
            angle: 360,
            duration: 300,
            onComplete: () => sword.destroy()
        });

        enemies.getChildren().forEach(enemy => {
            if (Phaser.Math.Distance.Between(player.x, player.y, enemy.x, enemy.y) < 50) {
                enemy.health = (enemy.health || 40) - 20;
                if (enemy.health <= 0) enemy.destroy();
                
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

    attackPlayer(enemy, player) {
        if (!this.gameStarted) return;
        player.health = (player.health || 100) - 5;
        if (player.health <= 0) player.destroy();
    }
}

function createAssets(scene) {
    const tileSize = 64;
    const graphics = scene.add.graphics();

    // Smiley (Player 1) with improved face
    graphics.clear();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 4, tileSize / 3, 8);
    graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 8);
    graphics.lineStyle(4, 0x000000);
    graphics.beginPath();
    graphics.arc(tileSize / 4, tileSize / 3 - 10, 10, 0, Math.PI, false);
    graphics.strokePath();
    graphics.beginPath();
    graphics.arc(3 * tileSize / 4, tileSize / 3 - 10, 10, 0, Math.PI, false);
    graphics.strokePath();
    graphics.lineStyle(6, 0x000000);
    graphics.beginPath();
    graphics.arc(tileSize / 2, 2 * tileSize / 3, tileSize / 4, Math.PI, 0, true);
    graphics.strokePath();
    graphics.generateTexture('smiley', tileSize, tileSize);

    // Mustache Smiley (Player 2) with improved face and mustache
    graphics.clear();
    graphics.fillStyle(0xffff00, 1);
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 4, tileSize / 3, 8);
    graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 8);
    graphics.lineStyle(4, 0x000000);
    graphics.beginPath();
    graphics.arc(tileSize / 4, tileSize / 3 - 10, 10, 0, Math.PI, false);
    graphics.strokePath();
    graphics.beginPath();
    graphics.arc(3 * tileSize / 4, tileSize / 3 - 10, 10, 0, Math.PI, false);
    graphics.strokePath();
    graphics.lineStyle(6, 0x000000);
    graphics.beginPath();
    graphics.arc(tileSize / 2, 2 * tileSize / 3, tileSize / 4, Math.PI, 0, true);
    graphics.strokePath();
    graphics.lineStyle(2, 0x000000);
    for (let i = 0; i < 4; i++) {
        graphics.beginPath();
        graphics.moveTo(tileSize / 2 - i * 8, 4 * tileSize / 5);
        graphics.lineTo(tileSize / 2 - i * 8 - 8, 4 * tileSize / 5 + 16);
        graphics.strokePath();
        graphics.beginPath();
        graphics.moveTo(tileSize / 2 + i * 8, 4 * tileSize / 5);
        graphics.lineTo(tileSize / 2 + i * 8 + 8, 4 * tileSize / 5 + 16);
        graphics.strokePath();
    }
    graphics.generateTexture('mustacheSmiley', tileSize, tileSize);

    // Mad Face (Enemy) with improved angry expression
    graphics.clear();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 4, tileSize / 3, 8);
    graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 8);
    graphics.lineStyle(4, 0x000000);
    graphics.beginPath();
    graphics.moveTo(tileSize / 4 - 10, tileSize / 3 - 10);
    graphics.lineTo(tileSize / 4 + 10, tileSize / 3 + 5);
    graphics.moveTo(3 * tileSize / 4 + 10, tileSize / 3 - 10);
    graphics.lineTo(3 * tileSize / 4 - 10, tileSize / 3 + 5);
    graphics.strokePath();
    graphics.beginPath();
    graphics.arc(tileSize / 2, tileSize / 2 + 10, tileSize / 4, Math.PI, 2 * Math.PI, true);
    graphics.strokePath();
    graphics.generateTexture('madFace', tileSize, tileSize);

    // Mini Boss with added face
    graphics.clear();
    graphics.fillStyle(0xff4500, 1);
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 3, tileSize / 3, 6);
    graphics.fillCircle(2 * tileSize / 3, tileSize / 3, 6);
    graphics.lineStyle(4, 0x000000);
    graphics.beginPath();
    graphics.moveTo(tileSize / 4, 2 * tileSize / 3);
    graphics.lineTo(3 * tileSize / 4, 2 * tileSize / 3);
    graphics.strokePath();
    graphics.beginPath();
    graphics.moveTo(tileSize / 4, tileSize / 4);
    graphics.lineTo(tileSize / 8, tileSize / 8);
    graphics.moveTo(3 * tileSize / 4, tileSize / 4);
    graphics.lineTo(7 * tileSize / 8, tileSize / 8);
    graphics.strokePath();
    graphics.generateTexture('miniBoss', tileSize, tileSize);

    // Boss with improved face and details
    graphics.clear();
    graphics.fillStyle(0x8b0000, 1);
    graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 3, tileSize / 3, 8);
    graphics.fillCircle(2 * tileSize / 3, tileSize / 3, 8);
    graphics.lineStyle(4, 0x000000);
    graphics.beginPath();
    graphics.moveTo(tileSize / 4, 2 * tileSize / 3);
    graphics.lineTo(tileSize / 2, 3 * tileSize / 4);
    graphics.lineTo(3 * tileSize / 4, 2 * tileSize / 3);
    graphics.strokePath();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(tileSize / 2 - 10, 2 * tileSize / 3, 5, 10);
    graphics.fillRect(tileSize / 2 + 5, 2 * tileSize / 3, 5, 10);
    graphics.lineStyle(8, 0xffff00);
    graphics.beginPath();
    graphics.moveTo(tileSize / 4, tileSize / 4);
    graphics.lineTo(tileSize / 2, tileSize / 8);
    graphics.lineTo(3 * tileSize / 4, tileSize / 4);
    graphics.strokePath();
    graphics.generateTexture('boss', tileSize, tileSize);

    // Door
    graphics.clear();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(8, 8, tileSize - 16, tileSize - 16);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 4, tileSize / 2, 12);
    graphics.generateTexture('door', tileSize, tileSize);

    // Chest
    graphics.clear();
    graphics.fillStyle(0xffd700, 1);
    graphics.fillRect(8, 8, tileSize - 16, tileSize - 16);
    graphics.lineStyle(8, 0x000000);
    graphics.beginPath();
    graphics.moveTo(8, tileSize / 2);
    graphics.lineTo(tileSize / 2, tileSize / 4);
    graphics.lineTo(tileSize - 8, tileSize / 2);
    graphics.strokePath();
    graphics.generateTexture('chest', tileSize, tileSize);

    // Key
    graphics.clear();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(tileSize / 4, tileSize / 4, tileSize / 2, 8);
    graphics.fillCircle(tileSize / 2, tileSize / 4, 16);
    graphics.generateTexture('key', tileSize, tileSize);

    // Sword
    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(tileSize / 2 - 8, 8, 16, tileSize / 2);
    graphics.fillRect(tileSize / 2 - 24, tileSize / 2, 48, 16);
    graphics.fillRect(tileSize / 2 - 8, tileSize / 2 + 16, 16, tileSize / 4);
    graphics.generateTexture('sword', tileSize, tileSize);

    // Tiles
    graphics.clear();
    graphics.fillStyle(0x666666, 1);
    graphics.fillRect(0, 0, tileSize, tileSize);
    graphics.generateTexture('tiles', tileSize, tileSize);
    graphics.clear();
}

let player1, player2, enemies, doors, chests, miniBoss, boss, keyItem, music;
let currentRoom = 'startRoom';
let helpTextVisible = true;

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
    scene: [SplashScene, MyGame], // Start with SplashScene
    parent: 'game-container',
    backgroundColor: '#2c2c2c'
};

const game = new Phaser.Game(config);
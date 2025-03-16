// Define the SplashScene (unchanged)
class SplashScene extends Phaser.Scene {
    constructor() {
        super('SplashScene');
    }

    preload() {
        this.load.image('splash', 'enemy_of_doom_splash.jpg');
    }

    create() {
        this.add.image(400, 300, 'splash').setOrigin(0.5);
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
        // Load assets (skip smiley and mustacheSmiley generation)
        createAssets(this, false, false); // Pass false for both smiley and mustacheSmiley
        this.load.audio('backgroundMusic', 'assets/backgroundMusic.mp3');
        // Load the spritesheet for Player 1 (using dude.png)
        this.load.spritesheet('smiley', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
        // Load the spritesheet for Player 2 (using dude_cyberpunk.png)
        this.load.spritesheet('cyberpunk', 'assets/dude_cyberpunk.png', { frameWidth: 32, frameHeight: 48 });
        // Load the enemy spritesheet
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 48, frameHeight: 48 });
        // Load sword swing sound effect (local file)
        console.log('Loading swoosh sound...');
        this.load.audio('swoosh', 'assets/swoosh.wav');
        // Load effect sprite
        this.load.image('effect', 'assets/effect.png');

        // Add load complete listener
        this.load.on('complete', () => {
            console.log('All assets loaded');
            // Check if swoosh sound is in cache
            if (this.cache.audio.exists('swoosh')) {
                console.log('Swoosh sound loaded successfully');
            } else {
                console.error('Swoosh sound not found in cache after loading');
            }
        });
    }

    create() {
        const tileSize = 64;

        this.gameStarted = false;

        // Player 1 with animation
        player1 = this.physics.add.sprite(400, 300, 'smiley').setScale(1.5);
        player1.health = 100;
        player1.setCollideWorldBounds(true);

        // Define animations for Player 1 (using dude.png frame ranges)
        const frames1 = this.anims.generateFrameNumbers('smiley');
        console.log('Number of frames in smiley:', frames1.length);

        if (frames1.length > 0) {
            this.anims.create({
                key: 'left',
                frames: this.anims.generateFrameNumbers('smiley', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'right',
                frames: this.anims.generateFrameNumbers('smiley', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'idle',
                frames: [ { key: 'smiley', frame: 4 } ],
                frameRate: 20
            });
        } else {
            console.error('No frames found in smiley spritesheet. Using static sprite.');
            player1.setTexture('smiley', 0);
        }

        // Player 2 with animation
        player2 = this.physics.add.sprite(450, 300, 'cyberpunk').setScale(1.5);
        player2.health = 100;
        player2.setCollideWorldBounds(true);

        // Define animations for Player 2 (using dude_cyberpunk.png frame ranges)
        const frames2 = this.anims.generateFrameNumbers('cyberpunk');
        console.log('Number of frames in cyberpunk:', frames2.length);

        if (frames2.length > 0) {
            this.anims.create({
                key: 'cyberpunk-left',
                frames: this.anims.generateFrameNumbers('cyberpunk', { start: 0, end: 3 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'cyberpunk-right',
                frames: this.anims.generateFrameNumbers('cyberpunk', { start: 5, end: 8 }),
                frameRate: 10,
                repeat: -1
            });
            this.anims.create({
                key: 'cyberpunk-idle',
                frames: [ { key: 'cyberpunk', frame: 4 } ],
                frameRate: 20
            });
        } else {
            console.error('No frames found in cyberpunk spritesheet. Using static sprite.');
            player2.setTexture('cyberpunk', 0);
        }

        enemies = this.physics.add.group();
        const enemyPositions = [
            { x: 300, y: 200 },
            { x: 500, y: 400 },
            { x: 600, y: 250 }
        ];

        // Create enemy animations
        this.anims.create({
            key: 'enemy-idle',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 5 }),
            frameRate: 8,
            repeat: -1
        });

        enemyPositions.forEach(pos => {
            const enemy = enemies.create(pos.x, pos.y, 'enemy').setScale(1);
            enemy.health = 40;
            enemy.setVelocity(0);
            enemy.setCollideWorldBounds(true);
            enemy.anims.play('enemy-idle', true);
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

        music = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
        this.input.once('pointerdown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume().then(() => {
                    console.log('AudioContext resumed');
                    if (!music.isPlaying) music.play();
                }).catch(err => console.error('Failed to resume AudioContext:', err));
            } else if (!music.isPlaying) {
                music.play();
            }
        }, this);

        this.input.keyboard.once('keydown', () => {
            if (this.sound.context.state === 'suspended') {
                this.sound.context.resume().then(() => {
                    console.log('AudioContext resumed');
                    if (!music.isPlaying) music.play();
                }).catch(err => console.error('Failed to resume AudioContext:', err));
            } else if (!music.isPlaying) {
                music.play();
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

        // Player 1 movement with animation
        if (player1 && player1.active) {
            player1.setVelocity(0);

            if (this.cursors.left.isDown) {
                player1.setVelocityX(-200);
                if (player1.anims) player1.anims.play('left', true);
            } else if (this.cursors.right.isDown) {
                player1.setVelocityX(200);
                if (player1.anims) player1.anims.play('right', true);
            } else if (this.cursors.up.isDown) {
                player1.setVelocityY(-200);
                if (player1.anims) player1.anims.play('idle', true);
            } else if (this.cursors.down.isDown) {
                player1.setVelocityY(200);
                if (player1.anims) player1.anims.play('idle', true);
            } else {
                if (player1.anims) player1.anims.play('idle', true);
            }
        }

        // Player 2 movement with animation
        if (player2 && player2.active) {
            player2.setVelocity(0);

            if (this.keys.a.isDown) {
                player2.setVelocityX(-200);
                if (player2.anims) player2.anims.play('cyberpunk-left', true);
            } else if (this.keys.d.isDown) {
                player2.setVelocityX(200);
                if (player2.anims) player2.anims.play('cyberpunk-right', true);
            } else if (this.keys.w.isDown) {
                player2.setVelocityY(-200);
                if (player2.anims) player2.anims.play('cyberpunk-idle', true);
            } else if (this.keys.s.isDown) {
                player2.setVelocityY(200);
                if (player2.anims) player2.anims.play('cyberpunk-idle', true);
            } else {
                if (player2.anims) player2.anims.play('cyberpunk-idle', true);
            }
        }

        enemies.getChildren().forEach(enemy => {
            if (player1 && player1.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, player1.x, player1.y) < 20) {
                this.attackPlayer(enemy, player1);
            }
            if (player2 && player2.active && Phaser.Math.Distance.Between(enemy.x, enemy.y, player2.x, player2.y) < 20) {
                this.attackPlayer(enemy, player2);
            }
        });

        if (player1 && player1.active && Phaser.Input.Keyboard.JustDown(this.keys.space)) this.attack(player1);
        if (player2 && player2.active && Phaser.Input.Keyboard.JustDown(this.keys.q)) this.attack(player2);

        if (Phaser.Input.Keyboard.JustDown(this.keys.h)) {
            this.helpText.classList.toggle('hidden');
            helpTextVisible = !helpTextVisible;
        }
    }

    startGame() {
        this.gameStarted = true;
        if (this.countdownText) this.countdownText.destroy();
        if (this.countdownBg) this.countdownBg.destroy();
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
        
        // Determine attack direction based on last movement or facing direction
        let attackAngle = 0;
        let startAngle = -45;
        let endAngle = 135;
        
        if (player === player1) {
            if (this.cursors.left.isDown) {
                attackAngle = 180;
                startAngle = 135;
                endAngle = 315;
            } else if (this.cursors.right.isDown) {
                attackAngle = 0;
                startAngle = -45;
                endAngle = 135;
            } else if (this.cursors.up.isDown) {
                attackAngle = -90;
                startAngle = 45;
                endAngle = 225;
            } else if (this.cursors.down.isDown) {
                attackAngle = 90;
                startAngle = 225;
                endAngle = 405;
            } else if (player.anims.currentAnim) {
                // Use the current animation to determine direction
                if (player.anims.currentAnim.key === 'left') {
                    attackAngle = 180;
                    startAngle = 135;
                    endAngle = 315;
                } else if (player.anims.currentAnim.key === 'right') {
                    attackAngle = 0;
                    startAngle = -45;
                    endAngle = 135;
                }
            }
        } else if (player === player2) {
            if (this.keys.a.isDown) {
                attackAngle = 180;
                startAngle = 135;
                endAngle = 315;
            } else if (this.keys.d.isDown) {
                attackAngle = 0;
                startAngle = -45;
                endAngle = 135;
            } else if (this.keys.w.isDown) {
                attackAngle = -90;
                startAngle = 45;
                endAngle = 225;
            } else if (this.keys.s.isDown) {
                attackAngle = 90;
                startAngle = 225;
                endAngle = 405;
            } else if (player.anims.currentAnim) {
                // Use the current animation to determine direction
                if (player.anims.currentAnim.key === 'cyberpunk-left') {
                    attackAngle = 180;
                    startAngle = 135;
                    endAngle = 315;
                } else if (player.anims.currentAnim.key === 'cyberpunk-right') {
                    attackAngle = 0;
                    startAngle = -45;
                    endAngle = 135;
                }
            }
        }
        
        // Create sword with offset based on direction
        const swordOffset = 30;
        const offsetX = Math.cos(attackAngle * Math.PI / 180) * swordOffset;
        const offsetY = Math.sin(attackAngle * Math.PI / 180) * swordOffset;
        
        const sword = scene.physics.add.sprite(player.x + offsetX, player.y + offsetY, 'sword').setScale(1);
        sword.setDepth(1);
        sword.setOrigin(0.5, 0.8); // Adjust origin for better rotation
        sword.angle = attackAngle; // Set initial angle
        
        // Create trail effect
        const createTrailEffect = (x, y, angle) => {
            const trail = scene.add.sprite(x, y, 'effect')
                .setScale(0.3)
                .setAlpha(0.4)
                .setTint(0x4488ff)
                .setRotation(angle * Math.PI / 180);
            
            scene.tweens.add({
                targets: trail,
                alpha: 0,
                scale: 0.1,
                duration: 200,
                onComplete: () => trail.destroy()
            });
        };
        
        // Create flash effects using sprites
        const createFlashEffect = (x, y, angle) => {
            const flash = scene.add.sprite(x, y, 'effect')
                .setScale(0.5)
                .setAlpha(0.6)
                .setTint(0xFFFFFF)
                .setRotation(angle * Math.PI / 180);
            
            scene.tweens.add({
                targets: flash,
                alpha: 0,
                scale: 1.5,
                duration: 200,
                onComplete: () => flash.destroy()
            });
        };
        
        // Create initial flash effects
        for (let i = 0; i < 3; i++) {
            const flashAngle = attackAngle + (i - 1) * 30;
            const flashDist = 20;
            createFlashEffect(
                sword.x + Math.cos(flashAngle * Math.PI / 180) * flashDist,
                sword.y + Math.sin(flashAngle * Math.PI / 180) * flashDist,
                flashAngle
            );
        }
        
        // Create a more dynamic swing animation
        let progress = 0;
        scene.tweens.add({
            targets: sword,
            angle: { from: startAngle + attackAngle, to: endAngle + attackAngle },
            scaleX: { from: 1, to: 1.5, yoyo: true },
            scaleY: { from: 1, to: 1.2, yoyo: true },
            duration: 300,
            ease: 'Power1',
            onUpdate: (tween) => {
                // Update sword position to follow player
                const currentAngle = (startAngle + (endAngle - startAngle) * tween.progress) * Math.PI / 180;
                sword.x = player.x + Math.cos(currentAngle + attackAngle * Math.PI / 180) * swordOffset;
                sword.y = player.y + Math.sin(currentAngle + attackAngle * Math.PI / 180) * swordOffset;
                
                // Create trail effect
                if (tween.progress - progress > 0.1) {
                    progress = tween.progress;
                    createTrailEffect(sword.x, sword.y, sword.angle);
                }
                
                // Check for enemy hits during the swing
                enemies.getChildren().forEach(enemy => {
                    if (Phaser.Math.Distance.Between(sword.x, sword.y, enemy.x, enemy.y) < 50) {
                        if (!enemy.isHit) {
                            enemy.isHit = true;
                            enemy.health = (enemy.health || 40) - 20;
                            
                            // Enhanced hit effect
                            const hitAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
                            for (let i = 0; i < 4; i++) {
                                const flash = scene.add.sprite(
                                    enemy.x + Math.cos(hitAngle) * (i * 5),
                                    enemy.y + Math.sin(hitAngle) * (i * 5),
                                    'effect'
                                )
                                .setScale(0.3)
                                .setTint(0xff0000)
                                .setAlpha(0.6 - i * 0.1)
                                .setRotation(hitAngle);
                                
                                scene.tweens.add({
                                    targets: flash,
                                    alpha: 0,
                                    scale: 1,
                                    duration: 200 + i * 50,
                                    onComplete: () => flash.destroy()
                                });
                            }

                            // Damage text with improved animation
                            const damageText = scene.add.text(enemy.x, enemy.y - 20, '-20', {
                                fontSize: '20px',
                                fill: '#FF0000',
                                stroke: '#000000',
                                strokeThickness: 4
                            }).setOrigin(0.5);
                            
                            scene.tweens.add({
                                targets: damageText,
                                y: damageText.y - 40,
                                alpha: 0,
                                scale: 1.5,
                                duration: 800,
                                ease: 'Power2',
                                onComplete: () => damageText.destroy()
                            });

                            // Enhanced knockback effect
                            const knockbackAngle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
                            const knockbackForce = 250;
                            enemy.setVelocity(
                                Math.cos(knockbackAngle) * knockbackForce,
                                Math.sin(knockbackAngle) * knockbackForce
                            );
                            
                            // Check for enemy death
                            if (enemy.health <= 0) {
                                // Enhanced death animation
                                scene.tweens.add({
                                    targets: enemy,
                                    alpha: 0,
                                    scale: 1.5,
                                    rotation: knockbackAngle + Math.PI,
                                    duration: 300,
                                    onComplete: () => enemy.destroy()
                                });
                                
                                // Add death particles
                                for (let i = 0; i < 8; i++) {
                                    const angle = (i / 8) * Math.PI * 2;
                                    const particle = scene.add.sprite(enemy.x, enemy.y, 'effect')
                                        .setScale(0.2)
                                        .setTint(0xff0000);
                                    
                                    scene.tweens.add({
                                        targets: particle,
                                        x: enemy.x + Math.cos(angle) * 50,
                                        y: enemy.y + Math.sin(angle) * 50,
                                        alpha: 0,
                                        scale: 0.1,
                                        duration: 500,
                                        ease: 'Power2',
                                        onComplete: () => particle.destroy()
                                    });
                                }
                            }
                        }
                    }
                });
            },
            onComplete: () => {
                sword.destroy();
                enemies.getChildren().forEach(enemy => {
                    enemy.isHit = false;
                });
            }
        });

        // Add swing sound effect with error handling
        try {
            if (this.cache.audio.exists('swoosh')) {
                const swoosh = scene.sound.add('swoosh', { volume: 0.5 });
                swoosh.play();
            }
        } catch (error) {
            console.error('Error playing swoosh sound:', error);
        }
    }

    attackPlayer(enemy, player) {
        if (!this.gameStarted) return;
        player.health = (player.health || 100) - 5;
        if (player.health <= 0) player.destroy();
    }
}

function createAssets(scene, includeSmiley = true, includeMustacheSmiley = true) {
    const tileSize = 64;
    const graphics = scene.add.graphics();

    if (includeSmiley) {
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
    }

    if (includeMustacheSmiley) {
        graphics.clear();
        graphics.fillStyle(0xffff00, 1);
        graphics.fillCircle(tileSize / 2, tileSize / 2, tileSize / 2 - 8);
        graphics.fillStyle(0x000000, 1);
        graphics.fillCircle(tileSize / 4, tileSize / 3, 8);
        graphics.fillCircle(3 * tileSize / 4, tileSize / 3, 8);
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(tileSize / 4 + 2, tileSize / 3 - 2, 2);
        graphics.fillCircle(3 * tileSize / 4 + 2, tileSize / 3 - 2, 2);
        graphics.lineStyle(4, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(tileSize / 4, tileSize / 3 - 10, 10, 0, Math.PI, false);
        graphics.strokePath();
        graphics.beginPath();
        graphics.arc(3 * tileSize / 4, tileSize / 3 - 10, 10, 0, Math.PI, false);
        graphics.strokePath();
        graphics.lineStyle(2, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(tileSize / 2, tileSize / 2 - 5, 5, Math.PI, 0, true);
        graphics.strokePath();
        graphics.lineStyle(6, 0x000000, 1);
        graphics.beginPath();
        graphics.arc(tileSize / 2, 2 * tileSize / 3, tileSize / 4, Math.PI, 0, true);
        graphics.strokePath();
        graphics.lineStyle(2, 0x000000, 1);
        for (let i = 0; i < 3; i++) {
            graphics.beginPath();
            graphics.moveTo(tileSize / 2 - 5 - i * 5, tileSize / 2 + 5);
            graphics.arc(tileSize / 2 - 15 - i * 5, tileSize / 2 + 15, 10, Math.PI, 0, false);
            graphics.lineTo(tileSize / 2 - 25 - i * 5, tileSize / 2 + 10);
            graphics.strokePath();
            graphics.beginPath();
            graphics.moveTo(tileSize / 2 + 5 + i * 5, tileSize / 2 + 5);
            graphics.arc(tileSize / 2 + 15 + i * 5, tileSize / 2 + 15, 10, Math.PI, 0, false);
            graphics.lineTo(tileSize / 2 + 25 + i * 5, tileSize / 2 + 10);
            graphics.strokePath();
        }
        graphics.generateTexture('mustacheSmiley', tileSize, tileSize);
    }

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

    graphics.clear();
    graphics.fillStyle(0x808080, 1);
    graphics.fillRect(8, 8, tileSize - 16, tileSize - 16);
    graphics.fillStyle(0x000000, 1);
    graphics.fillCircle(tileSize / 4, tileSize / 2, 12);
    graphics.generateTexture('door', tileSize, tileSize);

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

    graphics.clear();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(tileSize / 4, tileSize / 4, tileSize / 2, 8);
    graphics.fillCircle(tileSize / 2, tileSize / 4, 16);
    graphics.generateTexture('key', tileSize, tileSize);

    graphics.clear();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(tileSize / 2 - 8, 8, 16, tileSize / 2);
    graphics.fillRect(tileSize / 2 - 24, tileSize / 2, 48, 16);
    graphics.fillRect(tileSize / 2 - 8, tileSize / 2 + 16, 16, tileSize / 4);
    graphics.generateTexture('sword', tileSize, tileSize);

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
    scene: [SplashScene, MyGame],
    parent: 'game-container',
    backgroundColor: '#2c2c2c'
};

const game = new Phaser.Game(config);
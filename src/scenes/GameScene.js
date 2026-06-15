import Phaser from 'phaser';
import SocketManager from '../game/SocketManager';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  init(data) {
    this.roomCode = data.roomCode || 'TEST';
    this.isHost = data.isHost || false;
    this.playerId = 'p' + Date.now();
    this.arenaLevel = data.arenaLevel || 1;
    this.otherPlayers = new Map();
  }

  create() {
    const { width, height } = this.cameras.main;
    
    const bgColor = this.arenaLevel === 1 ? 0x1a1a3a : (this.arenaLevel === 2 ? 0x2a1a3a : 0x1a2a3a);
    this.add.rectangle(width/2, height/2, width-30, height-30, bgColor).setStrokeStyle(6, 0x4a90e2);

    this.walls = this.physics.add.staticGroup();
    this.walls.create(width/2, 50, null).setDisplaySize(width-40, 10).setTint(0x4a90e2).refreshBody();
    this.walls.create(width/2, height-50, null).setDisplaySize(width-40, 10).setTint(0x4a90e2).refreshBody();
    this.walls.create(50, height/2, null).setDisplaySize(10, height-80).setTint(0x4a90e2).refreshBody();
    this.walls.create(width-50, height/2, null).setDisplaySize(10, height-80).setTint(0x4a90e2).refreshBody();

    this.hazard = this.add.graphics();
    this.hazard.lineStyle(6, 0xff4444);
    this.hazard.strokeLineShape(new Phaser.Geom.Line(width/2 - 120, height/2, width/2 + 120, height/2));
    this.hazard.rotationSpeed = 0.02 * this.arenaLevel;
    this.hazard.setPosition(width/2, height/2);

    this.add.text(width/2, 25, `OR B C H A S E  |  Arena ${this.arenaLevel}  |  Room: ${this.roomCode}`, {
      fontSize: '18px',
      fill: '#4a90e2'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(40, 55, 'SCORE: 0', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' });
    this.timerText = this.add.text(width/2, 55, 'TIME: 3:00', { fontSize: '20px', fill: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = this.add.text(width - 140, 55, 'LVL 1', { fontSize: '18px', fill: '#a0c4ff' });

    // Local player
    this.player = this.physics.add.image(width/2, height/2, null);
    this.player.setDisplaySize(32, 32);
    this.player.setTint(0x00ff88);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setCircle(16);
    this.playerEmoji = this.add.text(width/2, height/2, '⚡', { fontSize: '22px' }).setOrigin(0.5);

    // Orbs
    this.orbs = this.physics.add.group();
    const orbPositions = this.arenaLevel === 1 ? 
      [[150,180],[300,220],[450,160],[600,240],[750,190],[200,420],[400,480],[650,430]] :
      [[120,150],[280,200],[500,140],[720,180],[180,380],[380,450],[620,390],[780,420]];
    
    orbPositions.forEach((pos, i) => {
      const orb = this.physics.add.image(pos[0], pos[1], null);
      orb.setDisplaySize(20, 20);
      orb.setTint(0xffd700);
      orb.body.setImmovable(true);
      orb.body.setCircle(10);
      orb.orbId = 'orb' + i;
      this.add.rectangle(pos[0], pos[1], 26, 26, 0xffd700, 0.2).setOrigin(0.5);
      this.orbs.add(orb);
    });

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.orbs, this.collectOrb, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,SPACE');
    this.dashCooldown = 0;

    this.timeLeft = 180;
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true
    });

    this.add.text(width/2, height - 35, 'WASD Move  •  SPACE Dash  •  Collect Orbs  •  Dodge Hazard  •  See others move live!', {
      fontSize: '13px',
      fill: '#888'
    }).setOrigin(0.5);

    // === MULTIPLAYER INIT ===
    this.socketManager = new SocketManager(this);
    this.socketManager.joinRoom(this.roomCode, 'Player' + this.playerId.slice(-3));

    // Callbacks for sync (defined on scene)
    this.onRoomJoined = (data) => {
      console.log('Room joined with players:', data.players);
    };
    this.onPlayerJoined = (data) => {
      if (data.id === this.socketManager.socket.id) return;
      const other = this.physics.add.image(data.x || 300, data.y || 400, null);
      other.setDisplaySize(28, 28);
      other.setTint(0xff8800);
      other.body.setCircle(14);
      other.playerId = data.id;
      this.otherPlayers.set(data.id, other);
    };
    this.onPlayerMoved = (data) => {
      const other = this.otherPlayers.get(data.id);
      if (other) {
        // Simple reconciliation: lerp towards server pos
        other.x = Phaser.Math.Linear(other.x, data.x, 0.6);
        other.y = Phaser.Math.Linear(other.y, data.y, 0.6);
      }
    };
    this.onPlayerDashed = (data) => {
      const other = this.otherPlayers.get(data.id);
      if (other) {
        other.setTint(0xffaa00);
        this.time.delayedCall(200, () => other && other.setTint(0xff8800));
      }
    };
    this.onOrbCollected = (data) => {
      // Update score if needed
      if (data.score) this.scoreText.setText('SCORE: ' + data.score);
    };
  }

  collectOrb(player, orb) {
    const orbId = orb.orbId;
    orb.destroy();
    const currentScore = parseInt(this.scoreText.text.split(': ')[1]) + 15;
    this.scoreText.setText('SCORE: ' + currentScore);
    
    if (this.socketManager) this.socketManager.sendCollect(this.roomCode, orbId);

    this.time.delayedCall(2200, () => {
      if (orb.scene === undefined) {
        const newOrb = this.physics.add.image(
          100 + Math.random() * (this.cameras.main.width - 200),
          120 + Math.random() * (this.cameras.main.height - 200),
          null
        );
        newOrb.setDisplaySize(20, 20);
        newOrb.setTint(0xffd700);
        newOrb.body.setImmovable(true);
        newOrb.body.setCircle(10);
        newOrb.orbId = 'orb' + Date.now();
        this.orbs.add(newOrb);
        this.physics.add.overlap(this.player, newOrb, this.collectOrb, null, this);
      }
    });
  }

  updateTimer() {
    this.timeLeft--;
    const min = Math.floor(this.timeLeft / 60);
    const sec = this.timeLeft % 60;
    this.timerText.setText(`TIME: ${min}:${sec.toString().padStart(2, '0')}`);
    
    if (this.timeLeft <= 0) {
      this.timerEvent.remove();
      if (this.socketManager) this.socketManager.disconnect();
      const finalScore = parseInt(this.scoreText.text.split(': ')[1]);
      this.scene.start('ResultsScene', { score: finalScore, xpGained: Math.floor(finalScore / 2) + 25 });
    }
  }

  update(time, delta) {
    const speed = 260;
    let vx = 0, vy = 0;
    
    if (this.cursors.left.isDown || this.wasd.A.isDown) vx = -speed;
    if (this.cursors.right.isDown || this.wasd.D.isDown) vx = speed;
    if (this.cursors.up.isDown || this.wasd.W.isDown) vy = -speed;
    if (this.cursors.down.isDown || this.wasd.S.isDown) vy = speed;
    
    this.player.setVelocity(vx, vy);
    this.playerEmoji.setPosition(this.player.x, this.player.y);

    // Send position to server (throttled)
    if (this.socketManager && this.time.now % 3 === 0) {
      this.socketManager.sendMove(this.roomCode, this.player.x, this.player.y, vx, vy);
    }

    if (Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) && this.dashCooldown <= time) {
      this.player.setVelocity(vx * 3.2, vy * 3.2);
      this.dashCooldown = time + 1500;
      if (this.socketManager) this.socketManager.sendDash(this.roomCode, this.player.x, this.player.y);
      const trail = this.add.rectangle(this.player.x, this.player.y, 28, 28, 0x00ff88, 0.4);
      this.tweens.add({ targets: trail, alpha: 0, duration: 280, onComplete: () => trail.destroy() });
    }

    if (this.hazard) {
      this.hazard.rotation += this.hazard.rotationSpeed;
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.hazard.x, this.hazard.y);
      if (dist < 130 && this.timeLeft % 3 === 0) {
        this.player.setTint(0xff6666);
        this.time.delayedCall(180, () => this.player.setTint(0x00ff88));
      }
    }
  }
}
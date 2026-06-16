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
    this.otherPlayerEmojis = new Map();
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

    // Hazard collider (thin rotating bar for real overlap detection) - visual removed, mechanic preserved
    this.hazardBody = this.physics.add.image(width/2, height/2, null);
    this.hazardBody.setDisplaySize(240, 10);
    this.hazardBody.setAlpha(0);
    this.hazardBody.body.setImmovable(true);
    this.hazardBody.body.setCircle(5);
    this.hazardBody.rotationSpeed = 0.02 * this.arenaLevel;

    this.add.text(width/2, 25, `OR B C H A S E  |  Arena ${this.arenaLevel}  |  Room: ${this.roomCode}`, {
      fontSize: '18px',
      fill: '#4a90e2'
    }).setOrigin(0.5);

    this.scoreText = this.add.text(40, 55, 'SCORE: 0', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' });
    this.timerText = this.add.text(width/2, 55, 'TIME: 3:00', { fontSize: '20px', fill: '#ffd700', fontStyle: 'bold' }).setOrigin(0.5);
    this.levelText = this.add.text(width - 140, 55, 'LVL 1', { fontSize: '18px', fill: '#a0c4ff' });

    const playerEmojis = ['⚡','🔥','🌟','💎','🚀','👾','🦄','🌈','🐉','🎮'];
    const getEmoji = (id) => playerEmojis[id.split('').reduce((a,c)=>a+c.charCodeAt(0),0)%playerEmojis.length];
    this.orbColors = [0xff69b4,0x00ced1,0xda70d6,0x32cd32,0xffa500,0x4169e1,0xff1493,0x00fa9a];

    this.player = this.physics.add.image(width/2, height/2, null);
    this.player.setDisplaySize(32, 32);
    this.player.setAlpha(0);
    this.player.body.setCollideWorldBounds(true);
    this.player.body.setCircle(16);
    this.playerEmoji = this.add.text(width/2, height/2, getEmoji(this.playerId), { fontSize: '22px' }).setOrigin(0.5).setDepth(10);

    this.orbs = this.physics.add.group();
    const orbPositions = this.arenaLevel === 1 ? 
      [[150,180],[300,220],[450,160],[600,240],[750,190],[200,420],[400,480],[650,430]] :
      [[120,150],[280,200],[500,140],[720,180],[180,380],[380,450],[620,390],[780,420]];
    
    orbPositions.forEach((pos, i) => {
      const color = this.orbColors[i % this.orbColors.length];
      const orb = this.physics.add.image(pos[0], pos[1], null);
      orb.setDisplaySize(20, 20);
      orb.setTint(color);
      orb.body.setImmovable(true);
      orb.body.setCircle(10);
      orb.orbId = 'orb' + i;
      orb.setAlpha(0); // hide square base so only layered glow circles are visible
      // Layered circles for a glowing orb effect
      this.add.circle(pos[0], pos[1], 16, color, 0.15).setOrigin(0.5);
      this.add.circle(pos[0], pos[1], 11, color, 0.35).setOrigin(0.5);
      this.add.circle(pos[0], pos[1], 6, 0xffffff, 0.9).setOrigin(0.5);
      this.orbs.add(orb);
    });

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.overlap(this.player, this.orbs, this.collectOrb, null, this);

    // Hazard overlap (after player exists)
    this.physics.add.overlap(this.player, this.hazardBody, this.hitHazard, null, this);

    // Bad guy enemy - bounces chaotically, steals 1 point on touch (large emoji, no Unity logo)
    this.badGuy = this.add.text(200 + Math.random() * 100, 250 + Math.random() * 100, '👹', { fontSize: '64px' }).setOrigin(0.5);
    this.physics.add.existing(this.badGuy);
    this.badGuy.body.setCircle(24);
    this.badGuy.setBounce(1, 1);
    this.badGuy.setCollideWorldBounds(true);
    const initialSpeed = 180 + Math.random() * 80;
    const angle = Math.random() * Math.PI * 2;
    this.badGuy.setVelocity(Math.cos(angle) * initialSpeed, Math.sin(angle) * initialSpeed);
    this.physics.add.collider(this.badGuy, this.walls);
    this.physics.add.overlap(this.player, this.badGuy, this.hitBadGuy, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D,SPACE');
    this.lastDashTime = 0;
    this.lastDirection = { x: 1, y: 0 };
    this.lastMoveEmit = 0;

    // === AUDIO SETUP (Web Audio for ambient + SFX, no external assets) ===
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.ambientOscillators = [];
    this.startAmbientMusic();

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
      (data.players || []).forEach(p => {
        if (p.id !== this.socketManager.socket.id) {
          this.onPlayerJoined({ id: p.id, x: p.x, y: p.y });
        }
      });
    };
    this.onPlayerJoined = (data) => {
      if (data.id === this.socketManager.socket.id) return;
      if (this.otherPlayers.has(data.id)) return;
      const other = this.physics.add.image(data.x || 300, data.y || 400, null);
      other.setDisplaySize(28, 28);
      other.setAlpha(0);
      other.body.setCircle(14);
      other.playerId = data.id;
      const emoji = this.add.text(data.x || 300, data.y || 400, getEmoji(data.id), { fontSize: '20px' }).setOrigin(0.5).setDepth(10);
      this.otherPlayerEmojis.set(data.id, emoji);
      this.otherPlayers.set(data.id, other);
    };
    this.onPlayerLeft = (data) => {
      const other = this.otherPlayers.get(data.id);
      if (other) {
        other.destroy();
        this.otherPlayers.delete(data.id);
      }
      const emoji = this.otherPlayerEmojis.get(data.id);
      if (emoji) {
        emoji.destroy();
        this.otherPlayerEmojis.delete(data.id);
      }
    };
    this.onPlayerMoved = (data) => {
      const other = this.otherPlayers.get(data.id);
      if (other) {
        // Smoother reconciliation with lerp + optional velocity
        other.x = Phaser.Math.Linear(other.x, data.x, 0.5);
        other.y = Phaser.Math.Linear(other.y, data.y, 0.5);
        const emoji = this.otherPlayerEmojis.get(data.id);
        if (emoji) emoji.setPosition(other.x, other.y);
        if (data.vx !== undefined && data.vy !== undefined) {
          other.setVelocity(data.vx * 0.6, data.vy * 0.6);
        }
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
    this.playOrbCollect();
    
    if (this.socketManager) this.socketManager.sendCollect(this.roomCode, orbId);

    this.time.delayedCall(2200, () => {
      if (orb.scene === undefined) {
        const color = this.orbColors[Math.floor(Math.random() * this.orbColors.length)];
        const newOrb = this.physics.add.image(
          100 + Math.random() * (this.cameras.main.width - 200),
          120 + Math.random() * (this.cameras.main.height - 200),
          null
        );
        newOrb.setDisplaySize(20, 20);
        newOrb.setTint(color);
        newOrb.body.setImmovable(true);
        newOrb.body.setCircle(10);
        newOrb.orbId = 'orb' + Date.now();
        newOrb.setAlpha(0); // hide square base so only layered glow circles are visible
        // Layered circles for a glowing orb effect (match initial spawn)
        this.add.circle(newOrb.x, newOrb.y, 16, color, 0.15).setOrigin(0.5);
        this.add.circle(newOrb.x, newOrb.y, 11, color, 0.35).setOrigin(0.5);
        this.add.circle(newOrb.x, newOrb.y, 6, 0xffffff, 0.9).setOrigin(0.5);
        this.orbs.add(newOrb);
        this.physics.add.overlap(this.player, newOrb, this.collectOrb, null, this);
      }
    });
  }

  hitHazard() {
    this.flashDamage(this.player);
    this.playHazardHit();
    // simple knockback
    const bx = this.player.x - this.hazardBody.x;
    const by = this.player.y - this.hazardBody.y;
    this.player.setVelocity(bx * 4, by * 4);
  }

  hitBadGuy(player, enemy) {
    // Steal 1 point from player
    const currentScore = Math.max(0, parseInt(this.scoreText.text.split(': ')[1]) - 1);
    this.scoreText.setText('SCORE: ' + currentScore);
    this.flashDamage(player, 120, 0xff4444, 0x00ff88);
    this.playEnemyHit();
    // Chaotic bounce on hit
    const angle = Math.random() * Math.PI * 2;
    enemy.setVelocity(Math.cos(angle) * 220, Math.sin(angle) * 220);
  }

  flashDamage(target, duration = 180, flashColor = 0xff6666, origColor = 0x00ff88) {
    if (!target) return;
    target.setTint(flashColor);
    this.time.delayedCall(duration, () => target.setTint(origColor));
  }

  // Sound helpers using Web Audio API
  startAmbientMusic() {
    if (!this.audioContext) return;
    // Low pulsing drone for ambient atmosphere
    const baseFreqs = [55, 65, 82]; // deep bass notes
    baseFreqs.forEach((freq, idx) => {
      const osc = this.audioContext.createOscillator();
      osc.type = idx % 2 === 0 ? 'sine' : 'sawtooth';
      osc.frequency.value = freq;
      const gain = this.audioContext.createGain();
      gain.gain.value = 0.025;
      const filter = this.audioContext.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 180;
      // gentle LFO for pulsing
      const lfo = this.audioContext.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = 0.4 + idx * 0.1;
      const lfoGain = this.audioContext.createGain();
      lfoGain.gain.value = 0.015;
      lfo.connect(lfoGain);
      lfoGain.connect(gain.gain);
      lfo.start();
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioContext.destination);
      osc.start();
      this.ambientOscillators.push({ osc, gain, lfo });
    });
    // subtle high twinkles every few seconds
    this.ambientTwinkleInterval = setInterval(() => {
      if (!this.scene || this.scene.key !== 'GameScene') return;
      this.playTwinkle();
    }, 4200);
  }

  stopAmbientMusic() {
    if (this.ambientTwinkleInterval) {
      clearInterval(this.ambientTwinkleInterval);
    }
    this.ambientOscillators.forEach(({ osc, gain, lfo }) => {
      try {
        osc.stop();
        lfo.stop();
        gain.disconnect();
      } catch (e) {}
    });
    this.ambientOscillators = [];
  }

  playTwinkle() {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 880 + Math.random() * 440;
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.12;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 600;
    const decay = this.audioContext.createGain();
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(decay);
    decay.connect(this.audioContext.destination);
    osc.start();
    // quick fade
    gain.gain.setValueAtTime(0.12, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 1.2);
    setTimeout(() => {
      try { osc.stop(); gain.disconnect(); } catch (e) {}
    }, 1400);
  }

  playOrbCollect() {
    if (!this.audioContext) return;
    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    notes.forEach((freq, i) => {
      setTimeout(() => {
        const osc = this.audioContext.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = freq;
        const gain = this.audioContext.createGain();
        gain.gain.value = 0.25;
        osc.connect(gain);
        gain.connect(this.audioContext.destination);
        osc.start();
        gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.35);
        setTimeout(() => { try { osc.stop(); } catch (e) {} }, 400);
      }, i * 85);
    });
  }

  playDashSound() {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 180;
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.2;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    // sweep down
    osc.frequency.linearRampToValueAtTime(80, this.audioContext.currentTime + 0.28);
    gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.32);
    setTimeout(() => { try { osc.stop(); gain.disconnect(); } catch (e) {} }, 400);
  }

  playHazardHit() {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    osc.type = 'square';
    osc.frequency.value = 110;
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.18;
    const filter = this.audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 320;
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.frequency.linearRampToValueAtTime(55, this.audioContext.currentTime + 0.4);
    gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.45);
    setTimeout(() => { try { osc.stop(); } catch (e) {} }, 500);
  }

  playEnemyHit() {
    if (!this.audioContext) return;
    // descending "steal" sound
    const osc = this.audioContext.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = 340;
    const gain = this.audioContext.createGain();
    gain.gain.value = 0.22;
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    osc.start();
    osc.frequency.linearRampToValueAtTime(140, this.audioContext.currentTime + 0.35);
    gain.gain.linearRampToValueAtTime(0.001, this.audioContext.currentTime + 0.4);
    setTimeout(() => { try { osc.stop(); gain.disconnect(); } catch (e) {} }, 450);
  }

  updateTimer() {
    this.timeLeft--;
    const min = Math.floor(this.timeLeft / 60);
    const sec = this.timeLeft % 60;
    this.timerText.setText(`TIME: ${min}:${sec.toString().padStart(2, '0')}`);
    
    if (this.timeLeft <= 0) {
      this.timerEvent.remove();
      this.stopAmbientMusic();
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

    if (vx !== 0 || vy !== 0) {
      this.lastDirection = { x: vx, y: vy };
    }

    // Send position to server (throttled ~20Hz)
    if (this.socketManager && time > this.lastMoveEmit + 50) {
      this.lastMoveEmit = time;
      this.socketManager.sendMove(this.roomCode, this.player.x, this.player.y, vx, vy);
    }

    if (Phaser.Input.Keyboard.JustDown(this.wasd.SPACE) && time > this.lastDashTime + 1500) {
      this.lastDashTime = time;
      let dx = vx || this.lastDirection.x;
      let dy = vy || this.lastDirection.y;
      this.player.setVelocity(dx * 3.2, dy * 3.2);
      this.playDashSound();
      if (this.socketManager) this.socketManager.sendDash(this.roomCode, this.player.x, this.player.y);
      for (let i = 0; i < 4; i++) {
        const tx = this.player.x - (dx / 260) * 12 * i;
        const ty = this.player.y - (dy / 260) * 12 * i;
        const trail = this.add.rectangle(tx, ty, 26, 26, 0x00ff88, 0.35 - i * 0.07);
        this.tweens.add({ targets: trail, alpha: 0, duration: 260, onComplete: () => trail.destroy() });
      }
    }

    if (this.hazardBody) {
      this.hazardBody.rotation += this.hazardBody.rotationSpeed;
    }

    // Occasional chaotic velocity perturbation for bad guy enemy
    if (this.badGuy && Math.random() < 0.015) {
      const vx = this.badGuy.body.velocity.x;
      const vy = this.badGuy.body.velocity.y;
      this.badGuy.setVelocity(vx * (0.7 + Math.random() * 0.6), vy * (0.7 + Math.random() * 0.6));
    }
  }
}
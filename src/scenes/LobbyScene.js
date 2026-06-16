import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
    this.joinMode = false;
    this.roomCodeText = null;
    this.typedCode = '';
    this.playerLevel = 1;
  }

  create() {
    const { width, height } = this.cameras.main;

    // === STARRY SPACE BACKGROUND ===
    this.add.rectangle(width / 2, height / 2, width, height, 0x05050f);
    // Scattered stars for cosmic feel (reference style)
    for (let i = 0; i < 80; i++) {
      const sx = Phaser.Math.Between(20, width - 20);
      const sy = Phaser.Math.Between(20, height - 20);
      const star = this.add.circle(sx, sy, Phaser.Math.FloatBetween(0.6, 1.4), 0xffffff, Phaser.Math.FloatBetween(0.4, 0.9));
      if (Math.random() > 0.7) {
        // subtle twinkle
        this.tweens.add({ targets: star, alpha: 0.2, duration: 1200 + Math.random() * 800, yoyo: true, repeat: -1 });
      }
    }
    // A few distant colored orbs/nebula dots
    [0xff69b4, 0x00ced1, 0xda70d6].forEach((c, idx) => {
      this.add.circle(120 + idx * 280, 80 + idx * 40, 3, c, 0.25);
    });

    // === HEADER ===
    this.add.text(width / 2, 28, 'ORB CHASER', {
      fontSize: '42px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    // Neon glow layers for title
    this.add.text(width / 2, 28, 'ORB CHASER', {
      fontSize: '42px',
      fill: '#4a90e2',
      fontStyle: 'bold',
      alpha: 0.3
    }).setOrigin(0.5).setScale(1.06);
    this.add.text(width / 2, 55, 'MULTIPLAYER 2D ARENA', {
      fontSize: '14px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    // === LEFT SIDEBAR: CONNECTED PLAYERS (avatar style) ===
    const leftX = 135;
    const sidebarWidth = 230;
    const sidebarTop = 95;
    const sidebarHeight = 310;

    this.add.rectangle(leftX, sidebarTop + sidebarHeight / 2, sidebarWidth, sidebarHeight, 0x0d0d1f).setStrokeStyle(2, 0x4a90e2);

    this.add.text(leftX, sidebarTop - 18, 'CONNECTED PLAYERS', {
      fontSize: '13px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Sample players matching reference vibe (including self)
    this.playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const playerXP = parseInt(localStorage.getItem('playerXP') || '0');
    const playerName = localStorage.getItem('playerName') || 'You';
    const unlockedSkins = JSON.parse(localStorage.getItem('unlockedSkins') || '["⚡"]');
    const currentSkin = unlockedSkins[unlockedSkins.length - 1] || '⚡';

    const samplePlayers = [
      { name: playerName, skin: currentSkin, level: this.playerLevel, xp: playerXP, ready: true, isSelf: true },
      { name: 'NeonNinja', skin: '🥷', level: 8, xp: 420, ready: true },
      { name: 'OrbWhisper', skin: '🌟', level: 6, xp: 310, ready: true },
      { name: 'CosmicDrift', skin: '☄️', level: 5, xp: 240, ready: false },
      { name: 'PixelProwler', skin: '👾', level: 9, xp: 580, ready: true },
      { name: 'VoidRunner42', skin: '🚀', level: 4, xp: 180, ready: false },
      { name: 'StarChaser', skin: '🌈', level: 7, xp: 390, ready: true }
    ];

    samplePlayers.forEach((p, i) => {
      const y = sidebarTop + 22 + i * 38;
      // Avatar circle
      const avatarColor = p.isSelf ? 0x3a7bd5 : (p.ready ? 0x2a5a3c : 0x3a3a4a);
      this.add.circle(leftX - 72, y, 14, avatarColor).setStrokeStyle(1, 0x4a90e2);
      this.add.text(leftX - 72, y, p.skin, { fontSize: '16px' }).setOrigin(0.5);
      // Name + level
      this.add.text(leftX - 48, y - 6, p.name, {
        fontSize: '13px',
        fill: p.isSelf ? '#4ade80' : '#fff',
        fontStyle: p.isSelf ? 'bold' : 'normal'
      }).setOrigin(0, 0.5);
      this.add.text(leftX - 48, y + 9, `Lvl ${p.level}  •  ${p.xp} XP`, {
        fontSize: '10px',
        fill: '#888'
      }).setOrigin(0, 0.5);
      // Ready badge
      const statusColor = p.ready ? '#4ade80' : '#f59e0b';
      this.add.text(leftX + 78, y, p.ready ? 'READY' : 'PREP', {
        fontSize: '10px',
        fill: statusColor,
        fontStyle: 'bold'
      }).setOrigin(0.5);
    });

    // === CENTER: ARENA PREVIEW (reference style) ===
    const centerX = width / 2;
    const previewY = 195;
    const previewW = 380;
    const previewH = 260;

    // Neon frame for arena preview (like the glowing border in reference)
    this.add.rectangle(centerX, previewY, previewW + 12, previewH + 12, 0x0a0a1a).setStrokeStyle(3, 0x00f0ff);
    this.add.rectangle(centerX, previewY, previewW, previewH, 0x0f0f22).setStrokeStyle(2, 0x4a90e2);

    // Mini arena floor
    this.add.rectangle(centerX, previewY, previewW - 20, previewH - 20, 0x1a1a3a);

    // Neon inner border
    this.add.rectangle(centerX - 150, previewY - 90, 8, 180, 0x00f0ff);
    this.add.rectangle(centerX + 150, previewY - 90, 8, 180, 0x00f0ff);
    this.add.rectangle(centerX, previewY - 105, 300, 8, 0x00f0ff);
    this.add.rectangle(centerX, previewY + 105, 300, 8, 0x00f0ff);

    // Glowing orbs inside preview (reference has several colorful ones)
    const previewOrbs = [
      { x: centerX - 80, y: previewY - 40, c: 0x00ffff },
      { x: centerX + 60, y: previewY - 55, c: 0xff00aa },
      { x: centerX + 20, y: previewY + 30, c: 0x00ff88 },
      { x: centerX - 40, y: previewY + 50, c: 0xffaa00 }
    ];
    previewOrbs.forEach(o => {
      this.add.circle(o.x, o.y, 18, o.c, 0.15);
      this.add.circle(o.x, o.y, 11, o.c, 0.45);
      this.add.circle(o.x, o.y, 5, 0xffffff, 0.95);
    });

    // Sample player emojis positioned like the reference screenshot
    const previewPlayers = [
      { x: centerX - 60, y: previewY - 10, e: '🥷' },
      { x: centerX + 30, y: previewY - 20, e: '🌟' },
      { x: centerX - 20, y: previewY + 35, e: '👾' },
      { x: centerX + 70, y: previewY + 20, e: '🚀' }
    ];
    previewPlayers.forEach(p => {
      this.add.text(p.x, p.y, p.e, { fontSize: '20px' }).setOrigin(0.5);
    });

    this.add.text(centerX, previewY - 115, 'NEON NEXUS  •  ARENA 1', {
      fontSize: '12px',
      fill: '#4ade80'
    }).setOrigin(0.5);

    // === AUTHENTIC GAMEPLAY BUTTONS (spaced under arena preview) ===
    const btnY = previewY + 145;
    const btnWidth = 200;
    const btnHeight = 44;
    const gap = 40; // space between buttons

    // QUICK MATCH
    const quickBtn = this.add.rectangle(centerX - btnWidth - gap, btnY, btnWidth, btnHeight, 0x1a5a3c).setInteractive();
    this.add.text(centerX - btnWidth - gap, btnY, 'QUICK MATCH', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    quickBtn.on('pointerdown', () => {
      const roomCode = 'QUICK-' + Date.now().toString().slice(-5);
      const pName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
    });
    quickBtn.on('pointerover', () => quickBtn.setFillStyle(0x2a7a4c));
    quickBtn.on('pointerout', () => quickBtn.setFillStyle(0x1a5a3c));

    // CREATE ROOM
    const createBtn = this.add.rectangle(centerX, btnY, btnWidth, btnHeight, 0x1a3a5c).setInteractive();
    this.add.text(centerX, btnY, 'CREATE ROOM', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    createBtn.on('pointerdown', () => {
      const roomCode = 'ROOM-' + Date.now().toString().slice(-4);
      const pName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
    });
    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2a5a8c));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x1a3a5c));

    // JOIN ROOM
    const joinBtn = this.add.rectangle(centerX + btnWidth + gap, btnY, btnWidth, btnHeight, 0x1a3a5c).setInteractive();
    this.add.text(centerX + btnWidth + gap, btnY, 'JOIN ROOM', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    joinBtn.on('pointerdown', () => this.enterJoinMode());
    joinBtn.on('pointerover', () => joinBtn.setFillStyle(0x2a5a8c));
    joinBtn.on('pointerout', () => joinBtn.setFillStyle(0x1a3a5c));

    // Footer controls hint (concise, relevant to working features)
    this.add.text(width / 2, height - 28, 'WASD / Arrows Move  •  SPACE Dash  •  Collect Orbs  •  Dodge Hazards', {
      fontSize: '13px',
      fill: '#888'
    }).setOrigin(0.5);
  }

  enterJoinMode() {
    // Hide main buttons by clearing interactive objects (simple approach: restart scene in join mode)
    // For a clean single-scene solution we will overlay a code entry panel
    const { width, height } = this.cameras.main;

    // Dark overlay panel
    const panel = this.add.rectangle(width / 2, height / 2, 420, 220, 0x111122, 0.95).setStrokeStyle(2, 0x4a90e2);

    this.add.text(width / 2, height / 2 - 70, 'ENTER ROOM CODE', {
      fontSize: '22px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Display typed code
    this.typedCode = '';
    this.roomCodeText = this.add.text(width / 2, height / 2 - 10, '____', {
      fontSize: '32px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 40, 'Type 4-8 characters then press ENTER', {
      fontSize: '14px',
      fill: '#888'
    }).setOrigin(0.5);

    // Cancel button
    const cancel = this.add.rectangle(width / 2 - 80, height / 2 + 80, 120, 36, 0x3a3a3a).setInteractive();
    this.add.text(width / 2 - 80, height / 2 + 80, 'CANCEL', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    cancel.on('pointerdown', () => {
      panel.destroy();
      this.roomCodeText.destroy();
      cancel.destroy();
      confirmBtn.destroy();
      this.scene.restart(); // refresh clean lobby
    });

    // Confirm button
    const confirmBtn = this.add.rectangle(width / 2 + 80, height / 2 + 80, 120, 36, 0x1a5a3c).setInteractive();
    this.add.text(width / 2 + 80, height / 2 + 80, 'JOIN', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    confirmBtn.on('pointerdown', () => {
      if (this.typedCode.length >= 3) {
        const playerName = localStorage.getItem('playerName') || 'Player';
        this.scene.start('GameScene', { roomCode: this.typedCode.toUpperCase(), isHost: false, arenaLevel: 1, playerName });
      }
    });

    // Keyboard input for code
    this.input.keyboard.on('keydown', (event) => {
      if (event.key === 'Enter') {
        if (this.typedCode.length >= 3) {
          const playerName = localStorage.getItem('playerName') || 'Player';
          this.scene.start('GameScene', { roomCode: this.typedCode.toUpperCase(), isHost: false, arenaLevel: 1, playerName });
        }
      } else if (event.key === 'Backspace') {
        this.typedCode = this.typedCode.slice(0, -1);
        this.roomCodeText.setText(this.typedCode.padEnd(6, '_'));
      } else if (event.key.length === 1 && this.typedCode.length < 8 && /^[a-zA-Z0-9]$/.test(event.key)) {
        this.typedCode += event.key.toUpperCase();
        this.roomCodeText.setText(this.typedCode.padEnd(6, '_'));
      }
    });
  }

  startArena(arenaLevel) {
    const roomCode = 'ARENA-' + Date.now().toString().slice(-4);
    const playerName = localStorage.getItem('playerName') || 'Player';
    this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel, playerName });
  }
}
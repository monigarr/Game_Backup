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

    // === HEADER - clean crisp title with flanking emojis ===
    this.add.text(width / 2, 26, '⚡ ORB CHASER ⚡', {
      fontSize: '40px',
      fill: '#4a90e2',
      fontStyle: 'bold',
      stroke: '#0a0a1a',
      strokeThickness: 6
    }).setOrigin(0.5);
    this.add.text(width / 2, 52, 'MULTIPLAYER 2D ARENA', {
      fontSize: '14px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    // Load player progression (needed for level-gated arenas)
    this.playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');

    // === CENTER CONTENT: Stacked vertical buttons (one per row, centered) ===
    const centerX = width / 2;
    const startY = 170;
    const btnW = 320;
    const btnH = 52;
    const rowGap = 14;

    // === ARENA SELECT (Level Gated) - Easy / Med / Hard labels ===
    this.add.text(centerX, startY, 'SELECT ARENA', {
      fontSize: '14px',
      fill: '#888'
    }).setOrigin(0.5);

    // Arena 1: Easy (always available)
    const a1Y = startY + 38;
    const a1 = this.add.rectangle(centerX, a1Y, btnW, btnH, 0x2a5a3c).setInteractive();
    const a1Label = this.add.text(centerX, a1Y, 'Arena 1: Easy', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    a1Label.disableInteractive();
    a1.on('pointerdown', () => this.startArena(1));
    a1.on('pointerover', () => a1.setFillStyle(0x3a7a4c));
    a1.on('pointerout', () => a1.setFillStyle(0x2a5a3c));

    // Arena 2: Med (level >= 4)
    const a2Y = a1Y + btnH + rowGap;
    const a2Color = this.playerLevel >= 4 ? 0x2a5a3c : 0x333333;
    const a2 = this.add.rectangle(centerX, a2Y, btnW, btnH, a2Color).setInteractive();
    const a2Label = this.add.text(centerX, a2Y, 'Arena 2: Med', { fontSize: '20px', fill: this.playerLevel >= 4 ? '#fff' : '#666', fontStyle: 'bold' }).setOrigin(0.5);
    a2Label.disableInteractive();
    if (this.playerLevel >= 4) {
      a2.on('pointerdown', () => this.startArena(2));
      a2.on('pointerover', () => a2.setFillStyle(0x3a7a4c));
      a2.on('pointerout', () => a2.setFillStyle(0x2a5a3c));
    }

    // Arena 3: Hard (level >= 7)
    const a3Y = a2Y + btnH + rowGap;
    const a3Color = this.playerLevel >= 7 ? 0x2a5a3c : 0x333333;
    const a3 = this.add.rectangle(centerX, a3Y, btnW, btnH, a3Color).setInteractive();
    const a3Label = this.add.text(centerX, a3Y, 'Arena 3: Hard', { fontSize: '20px', fill: this.playerLevel >= 7 ? '#fff' : '#666', fontStyle: 'bold' }).setOrigin(0.5);
    a3Label.disableInteractive();
    if (this.playerLevel >= 7) {
      a3.on('pointerdown', () => this.startArena(3));
      a3.on('pointerover', () => a3.setFillStyle(0x3a7a4c));
      a3.on('pointerout', () => a3.setFillStyle(0x2a5a3c));
    }

    // === MAIN ACTION BUTTONS (stacked below arenas) ===
    const mainStartY = a3Y + btnH + 28;
    this.add.text(centerX, mainStartY, 'MATCH OPTIONS', {
      fontSize: '14px',
      fill: '#888'
    }).setOrigin(0.5);

    // QUICK MATCH
    const qY = mainStartY + 38;
    const quickBtn = this.add.rectangle(centerX, qY, btnW, btnH, 0x1a5a3c).setInteractive();
    const quickLabel = this.add.text(centerX, qY, 'QUICK MATCH', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    quickLabel.disableInteractive();
    quickBtn.on('pointerdown', () => {
      const roomCode = 'QUICK-' + Date.now().toString().slice(-5);
      const pName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
    });
    quickBtn.on('pointerover', () => quickBtn.setFillStyle(0x2a7a4c));
    quickBtn.on('pointerout', () => quickBtn.setFillStyle(0x1a5a3c));

    // CREATE ROOM
    const cY = qY + btnH + rowGap;
    const createBtn = this.add.rectangle(centerX, cY, btnW, btnH, 0x1a3a5c).setInteractive();
    const createLabel = this.add.text(centerX, cY, 'CREATE ROOM', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    createLabel.disableInteractive();
    createBtn.on('pointerdown', () => {
      const roomCode = 'ROOM-' + Date.now().toString().slice(-4);
      const pName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
    });
    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2a5a8c));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x1a3a5c));

    // JOIN ROOM
    const jY = cY + btnH + rowGap;
    const joinBtn = this.add.rectangle(centerX, jY, btnW, btnH, 0x1a3a5c).setInteractive();
    const joinLabel = this.add.text(centerX, jY, 'JOIN ROOM', { fontSize: '20px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
    joinLabel.disableInteractive();
    joinBtn.on('pointerdown', () => this.enterJoinMode());
    joinBtn.on('pointerover', () => joinBtn.setFillStyle(0x2a5a8c));
    joinBtn.on('pointerout', () => joinBtn.setFillStyle(0x1a3a5c));

    // Footer controls hint (concise, relevant to working features)
    this.add.text(width / 2, height - 28, 'WASD / Arrows Move  •  SPACE Dash  •  Collect Orbs', {
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
    const cancelLabel = this.add.text(width / 2 - 80, height / 2 + 80, 'CANCEL', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    cancelLabel.disableInteractive();
    cancel.on('pointerdown', () => {
      panel.destroy();
      this.roomCodeText.destroy();
      cancel.destroy();
      confirmBtn.destroy();
      this.scene.restart(); // refresh clean lobby
    });

    // Confirm button
    const confirmBtn = this.add.rectangle(width / 2 + 80, height / 2 + 80, 120, 36, 0x1a5a3c).setInteractive();
    const confirmLabel = this.add.text(width / 2 + 80, height / 2 + 80, 'JOIN', { fontSize: '16px', fill: '#fff' }).setOrigin(0.5);
    confirmLabel.disableInteractive();
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
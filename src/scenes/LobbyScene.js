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

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    this.add.text(width / 2, height / 2 - 160, 'ORBCHASE', {
      fontSize: '64px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 100, 'Multiplayer 2D Arena', {
      fontSize: '24px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    this.playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const playerXP = parseInt(localStorage.getItem('playerXP') || '0');
    this.add.text(width / 2, height / 2 - 60, `Level ${this.playerLevel}  •  ${playerXP} XP`, {
      fontSize: '18px',
      fill: '#ffd700'
    }).setOrigin(0.5);

    // Main action buttons - clean row
    const btnY = height / 2 + 10;

    // QUICK MATCH (original simple flow)
    const quickBtn = this.add.rectangle(width / 2, btnY, 260, 50, 0x1a5a3c).setInteractive();
    this.add.text(width / 2, btnY, 'QUICK MATCH (Arena 1)', {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5);

    quickBtn.on('pointerdown', () => {
      const roomCode = 'QUICK-' + Date.now().toString().slice(-5);
      const playerName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName });
    });
    quickBtn.on('pointerover', () => quickBtn.setFillStyle(0x2a7a4c));
    quickBtn.on('pointerout', () => quickBtn.setFillStyle(0x1a5a3c));

    // CREATE ROOM
    const createBtn = this.add.rectangle(width / 2 - 140, btnY + 70, 200, 45, 0x1a3a5c).setInteractive();
    this.add.text(width / 2 - 140, btnY + 70, 'CREATE ROOM', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    createBtn.on('pointerdown', () => {
      const roomCode = 'ROOM-' + Date.now().toString().slice(-4);
      const playerName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName });
    });
    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2a5a8c));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x1a3a5c));

    // JOIN ROOM (enters code entry mode)
    const joinBtn = this.add.rectangle(width / 2 + 140, btnY + 70, 200, 45, 0x1a3a5c).setInteractive();
    this.add.text(width / 2 + 140, btnY + 70, 'JOIN ROOM', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    joinBtn.on('pointerdown', () => this.enterJoinMode());
    joinBtn.on('pointerover', () => joinBtn.setFillStyle(0x2a5a8c));
    joinBtn.on('pointerout', () => joinBtn.setFillStyle(0x1a3a5c));

    // Arena select row (level gated)
    const arenaY = height / 2 + 140;
    this.add.text(width / 2, arenaY - 25, 'ARENAS (Level Gated)', {
      fontSize: '14px',
      fill: '#888'
    }).setOrigin(0.5);

    // Arena 1
    const a1 = this.add.rectangle(width / 2 - 150, arenaY + 15, 90, 38, 0x2a5a3c).setInteractive();
    this.add.text(width / 2 - 150, arenaY + 15, 'Arena 1', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
    a1.on('pointerdown', () => this.startArena(1));

    // Arena 2
    const a2Color = this.playerLevel >= 4 ? 0x2a5a3c : 0x333333;
    const a2 = this.add.rectangle(width / 2, arenaY + 15, 90, 38, a2Color).setInteractive();
    this.add.text(width / 2, arenaY + 15, 'Arena 2', { fontSize: '14px', fill: this.playerLevel >= 4 ? '#fff' : '#666' }).setOrigin(0.5);
    if (this.playerLevel >= 4) {
      a2.on('pointerdown', () => this.startArena(2));
    }

    // Arena 3
    const a3Color = this.playerLevel >= 7 ? 0x2a5a3c : 0x333333;
    const a3 = this.add.rectangle(width / 2 + 150, arenaY + 15, 90, 38, a3Color).setInteractive();
    this.add.text(width / 2 + 150, arenaY + 15, 'Arena 3', { fontSize: '14px', fill: this.playerLevel >= 7 ? '#fff' : '#666' }).setOrigin(0.5);
    if (this.playerLevel >= 7) {
      a3.on('pointerdown', () => this.startArena(3));
    }

    // Footer
    this.add.text(width / 2, height - 35, 'WASD/Arrows Move  •  SPACE Dash  •  Collect Orbs  •  Dodge Hazards', {
      fontSize: '13px',
      fill: '#666'
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
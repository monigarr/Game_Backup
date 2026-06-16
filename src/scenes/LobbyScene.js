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

    // Full dark background
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    // === LEFT SIDEBAR: CONNECTED PLAYERS ===
    const leftX = 130;
    const sidebarWidth = 220;
    const sidebarTop = 120;
    const sidebarHeight = 380;

    // Sidebar panel background
    this.add.rectangle(leftX, sidebarTop + sidebarHeight / 2, sidebarWidth, sidebarHeight, 0x111122).setStrokeStyle(2, 0x4a90e2);

    // Title
    this.add.text(leftX, sidebarTop - 25, 'CONNECTED PLAYERS', {
      fontSize: '14px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Load player data
    this.playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const playerXP = parseInt(localStorage.getItem('playerXP') || '0');
    const playerName = localStorage.getItem('playerName') || 'Player';
    const unlockedSkins = JSON.parse(localStorage.getItem('unlockedSkins') || '["⚡"]');
    const currentSkin = unlockedSkins[unlockedSkins.length - 1] || '⚡';

    // Self entry (first and only for now)
    const entryY = sidebarTop + 30;
    this.add.text(leftX - 70, entryY, currentSkin, { fontSize: '22px' }).setOrigin(0.5);
    this.add.text(leftX + 10, entryY - 5, playerName, {
      fontSize: '15px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0, 0.5);
    this.add.text(leftX + 10, entryY + 15, `Lvl ${this.playerLevel}  •  ${playerXP} XP`, {
      fontSize: '11px',
      fill: '#a0c4ff'
    }).setOrigin(0, 0.5);

    // Placeholder status line
    this.add.text(leftX, entryY + 45, 'READY', {
      fontSize: '11px',
      fill: '#4ade80'
    }).setOrigin(0.5);

    // === CENTER: LOGO + ACTIONS ===
    const centerX = width / 2;

    // Logo
    this.add.text(centerX, 80, 'ORB CHASER', {
      fontSize: '52px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(centerX, 115, 'MULTIPLAYER 2D ARENA', {
      fontSize: '16px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    // Player level header
    this.add.text(centerX, 155, `Level ${this.playerLevel}  •  ${playerXP} XP`, {
      fontSize: '16px',
      fill: '#ffd700'
    }).setOrigin(0.5);

    // Quick Match button (prominent)
    const btnY = 210;
    const quickBtn = this.add.rectangle(centerX, btnY, 280, 52, 0x1a5a3c).setInteractive();
    this.add.text(centerX, btnY, 'QUICK MATCH (Arena 1)', {
      fontSize: '20px',
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

    // Create / Join row
    const rowY = btnY + 70;
    const createBtn = this.add.rectangle(centerX - 110, rowY, 200, 44, 0x1a3a5c).setInteractive();
    this.add.text(centerX - 110, rowY, 'CREATE ROOM', {
      fontSize: '17px',
      fill: '#fff'
    }).setOrigin(0.5);

    createBtn.on('pointerdown', () => {
      const roomCode = 'ROOM-' + Date.now().toString().slice(-4);
      const pName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
    });
    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2a5a8c));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x1a3a5c));

    const joinBtn = this.add.rectangle(centerX + 110, rowY, 200, 44, 0x1a3a5c).setInteractive();
    this.add.text(centerX + 110, rowY, 'JOIN ROOM', {
      fontSize: '17px',
      fill: '#fff'
    }).setOrigin(0.5);

    joinBtn.on('pointerdown', () => this.enterJoinMode());
    joinBtn.on('pointerover', () => joinBtn.setFillStyle(0x2a5a8c));
    joinBtn.on('pointerout', () => joinBtn.setFillStyle(0x1a3a5c));

    // Arena select section (styled as preview area)
    const arenaY = rowY + 80;
    this.add.rectangle(centerX, arenaY + 20, 520, 90, 0x0f0f1f).setStrokeStyle(1, 0x4a90e2);

    this.add.text(centerX, arenaY - 15, 'ARENAS (Level Gated)', {
      fontSize: '13px',
      fill: '#888'
    }).setOrigin(0.5);

    // Arena 1
    const a1 = this.add.rectangle(centerX - 160, arenaY + 25, 95, 40, 0x2a5a3c).setInteractive();
    this.add.text(centerX - 160, arenaY + 25, 'Arena 1', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
    a1.on('pointerdown', () => this.startArena(1));

    // Arena 2
    const a2Color = this.playerLevel >= 4 ? 0x2a5a3c : 0x333333;
    const a2 = this.add.rectangle(centerX, arenaY + 25, 95, 40, a2Color).setInteractive();
    this.add.text(centerX, arenaY + 25, 'Arena 2', { fontSize: '14px', fill: this.playerLevel >= 4 ? '#fff' : '#666' }).setOrigin(0.5);
    if (this.playerLevel >= 4) {
      a2.on('pointerdown', () => this.startArena(2));
    }

    // Arena 3
    const a3Color = this.playerLevel >= 7 ? 0x2a5a3c : 0x333333;
    const a3 = this.add.rectangle(centerX + 160, arenaY + 25, 95, 40, a3Color).setInteractive();
    this.add.text(centerX + 160, arenaY + 25, 'Arena 3', { fontSize: '14px', fill: this.playerLevel >= 7 ? '#fff' : '#666' }).setOrigin(0.5);
    if (this.playerLevel >= 7) {
      a3.on('pointerdown', () => this.startArena(3));
    }

    // Footer
    this.add.text(centerX, height - 35, 'WASD/Arrows Move  •  SPACE Dash  •  Collect Orbs  •  Dodge Hazards', {
      fontSize: '12px',
      fill: '#666'
    }).setOrigin(0.5);

    // === RIGHT SIDEBAR: MATCH INFO ===
    const rightX = width - 130;
    const rightWidth = 220;

    this.add.rectangle(rightX, sidebarTop + sidebarHeight / 2, rightWidth, sidebarHeight, 0x111122).setStrokeStyle(2, 0x4a90e2);

    this.add.text(rightX, sidebarTop - 25, 'MATCH INFO', {
      fontSize: '14px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // Match details (reflect current defaults)
    const infoStartY = sidebarTop + 30;
    const lineH = 28;

    this.add.text(rightX - 70, infoStartY, 'Mode', { fontSize: '12px', fill: '#888' }).setOrigin(0, 0.5);
    this.add.text(rightX + 30, infoStartY, 'Classic Orb Chase', { fontSize: '13px', fill: '#fff' }).setOrigin(0, 0.5);

    this.add.text(rightX - 70, infoStartY + lineH, 'Arena', { fontSize: '12px', fill: '#888' }).setOrigin(0, 0.5);
    this.add.text(rightX + 30, infoStartY + lineH, 'Arena 1 (Default)', { fontSize: '13px', fill: '#fff' }).setOrigin(0, 0.5);

    this.add.text(rightX - 70, infoStartY + lineH * 2, 'Round Time', { fontSize: '12px', fill: '#888' }).setOrigin(0, 0.5);
    this.add.text(rightX + 30, infoStartY + lineH * 2, '3:00', { fontSize: '13px', fill: '#fff' }).setOrigin(0, 0.5);

    this.add.text(rightX - 70, infoStartY + lineH * 3, 'Players', { fontSize: '12px', fill: '#888' }).setOrigin(0, 0.5);
    this.add.text(rightX + 30, infoStartY + lineH * 3, '1 / 10', { fontSize: '13px', fill: '#4ade80' }).setOrigin(0, 0.5);

    this.add.text(rightX, infoStartY + lineH * 4.5, 'Select arena above', {
      fontSize: '11px',
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
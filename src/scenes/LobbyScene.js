import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
    this.nameInput = null;
    this.roomInput = null;
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

    // Progress display from localStorage
    const playerLevel = parseInt(localStorage.getItem('playerLevel') || '1');
    const playerXP = parseInt(localStorage.getItem('playerXP') || '0');
    this.add.text(width / 2, height / 2 - 60, `Level ${playerLevel}  •  ${playerXP} XP`, {
      fontSize: '18px',
      fill: '#ffd700'
    }).setOrigin(0.5);

    // DOM inputs for name and room code
    this.nameInput = document.createElement('input');
    this.nameInput.type = 'text';
    this.nameInput.placeholder = 'Your Name';
    this.nameInput.value = localStorage.getItem('playerName') || 'Player';
    this.nameInput.style.cssText = 'position:absolute;left:50%;top:38%;transform:translate(-50%,-50%);width:220px;padding:8px;font-size:16px;background:#1a1a3a;color:#fff;border:2px solid #4a90e2;border-radius:4px;';
    document.body.appendChild(this.nameInput);

    this.roomInput = document.createElement('input');
    this.roomInput.type = 'text';
    this.roomInput.placeholder = 'Room Code (e.g. ABC123)';
    this.roomInput.style.cssText = 'position:absolute;left:50%;top:46%;transform:translate(-50%,-50%);width:220px;padding:8px;font-size:16px;background:#1a1a3a;color:#fff;border:2px solid #4a90e2;border-radius:4px;';
    document.body.appendChild(this.roomInput);

    // Create Room button
    const createBtn = this.add.rectangle(width / 2 - 120, height / 2 + 20, 200, 45, 0x1a3a5c).setInteractive();
    this.add.text(width / 2 - 120, height / 2 + 20, 'CREATE ROOM', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    createBtn.on('pointerdown', () => {
      const roomCode = this.roomInput.value.trim() || 'ROOM-' + Date.now().toString().slice(-4);
      const playerName = this.nameInput.value.trim() || 'Player';
      localStorage.setItem('playerName', playerName);
      this.cleanupInputs();
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName });
    });

    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2a5a8c));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x1a3a5c));

    // Join Room button
    const joinBtn = this.add.rectangle(width / 2 + 120, height / 2 + 20, 200, 45, 0x1a3a5c).setInteractive();
    this.add.text(width / 2 + 120, height / 2 + 20, 'JOIN ROOM', {
      fontSize: '18px',
      fill: '#fff'
    }).setOrigin(0.5);

    joinBtn.on('pointerdown', () => {
      const roomCode = this.roomInput.value.trim();
      if (!roomCode) {
        this.roomInput.style.borderColor = '#ff4444';
        return;
      }
      const playerName = this.nameInput.value.trim() || 'Player';
      localStorage.setItem('playerName', playerName);
      this.cleanupInputs();
      this.scene.start('GameScene', { roomCode, isHost: false, arenaLevel: 1, playerName });
    });

    joinBtn.on('pointerover', () => joinBtn.setFillStyle(0x2a5a8c));
    joinBtn.on('pointerout', () => joinBtn.setFillStyle(0x1a3a5c));

    // Arena select (level-gated)
    const arenaY = height / 2 + 90;
    this.add.text(width / 2, arenaY - 25, 'SELECT ARENA (Level Gated)', {
      fontSize: '14px',
      fill: '#888'
    }).setOrigin(0.5);

    // Arena 1 - always unlocked
    const a1 = this.add.rectangle(width / 2 - 150, arenaY + 20, 90, 40, 0x2a5a3c).setInteractive();
    this.add.text(width / 2 - 150, arenaY + 20, 'Arena 1', { fontSize: '14px', fill: '#fff' }).setOrigin(0.5);
    a1.on('pointerdown', () => this.startArena(1, playerLevel));

    // Arena 2 - level >= 4
    const a2Color = playerLevel >= 4 ? 0x2a5a3c : 0x3a3a3a;
    const a2 = this.add.rectangle(width / 2, arenaY + 20, 90, 40, a2Color).setInteractive();
    this.add.text(width / 2, arenaY + 20, 'Arena 2', { fontSize: '14px', fill: playerLevel >= 4 ? '#fff' : '#666' }).setOrigin(0.5);
    if (playerLevel >= 4) {
      a2.on('pointerdown', () => this.startArena(2, playerLevel));
    }

    // Arena 3 - level >= 7
    const a3Color = playerLevel >= 7 ? 0x2a5a3c : 0x3a3a3a;
    const a3 = this.add.rectangle(width / 2 + 150, arenaY + 20, 90, 40, a3Color).setInteractive();
    this.add.text(width / 2 + 150, arenaY + 20, 'Arena 3', { fontSize: '14px', fill: playerLevel >= 7 ? '#fff' : '#666' }).setOrigin(0.5);
    if (playerLevel >= 7) {
      a3.on('pointerdown', () => this.startArena(3, playerLevel));
    }

    this.add.text(width / 2, height - 40, 'WASD / Arrows: Move  •  SPACE: Dash  •  Collect orbs, avoid hazards', {
      fontSize: '14px',
      fill: '#666'
    }).setOrigin(0.5);
  }

  startArena(arenaLevel, currentLevel) {
    const roomCode = this.roomInput ? (this.roomInput.value.trim() || 'ARENA-' + Date.now().toString().slice(-4)) : 'ARENA-' + Date.now().toString().slice(-4);
    const playerName = this.nameInput ? (this.nameInput.value.trim() || 'Player') : 'Player';
    localStorage.setItem('playerName', playerName);
    this.cleanupInputs();
    this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel, playerName });
  }

  cleanupInputs() {
    if (this.nameInput && this.nameInput.parentNode) this.nameInput.parentNode.removeChild(this.nameInput);
    if (this.roomInput && this.roomInput.parentNode) this.roomInput.parentNode.removeChild(this.roomInput);
    this.nameInput = null;
    this.roomInput = null;
  }

  shutdown() {
    this.cleanupInputs();
  }
}
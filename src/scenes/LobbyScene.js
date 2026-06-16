import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    this.add.text(width / 2, height / 2 - 120, 'ORBCHASE', {
      fontSize: '64px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 40, 'Multiplayer 2D Arena', {
      fontSize: '24px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    const startBtn = this.add.rectangle(width / 2, height / 2 + 60, 280, 60, 0x1a3a5c).setInteractive();
    this.add.text(width / 2, height / 2 + 60, 'QUICK MATCH (Arena 1)', {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene', { roomCode: 'SOLO-' + Date.now().toString().slice(-4), isHost: true, arenaLevel: 1 });
    });

    startBtn.on('pointerover', () => startBtn.setFillStyle(0x2a5a8c));
    startBtn.on('pointerout', () => startBtn.setFillStyle(0x1a3a5c));

    this.add.text(width / 2, height - 40, 'WASD / Arrows: Move  •  SPACE: Dash  •  Collect orbs, avoid hazards', {
      fontSize: '14px',
      fill: '#666'
    }).setOrigin(0.5);
  }
}
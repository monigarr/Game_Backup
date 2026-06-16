import Phaser from 'phaser';

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data) {
    this.score = data.score || 0;
    this.xpGained = data.xpGained || 0;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    this.add.text(width / 2, height / 2 - 80, 'MATCH COMPLETE', {
      fontSize: '48px',
      fill: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2, `SCORE: ${this.score}`, {
      fontSize: '36px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 60, `+${this.xpGained} XP`, {
      fontSize: '28px',
      fill: '#4a90e2'
    }).setOrigin(0.5);

    const replayBtn = this.add.rectangle(width / 2, height / 2 + 140, 240, 50, 0x1a3a5c).setInteractive();
    this.add.text(width / 2, height / 2 + 140, 'PLAY AGAIN', {
      fontSize: '20px',
      fill: '#fff'
    }).setOrigin(0.5);

    replayBtn.on('pointerdown', () => {
      this.scene.start('LobbyScene');
    });

    replayBtn.on('pointerover', () => replayBtn.setFillStyle(0x2a5a8c));
    replayBtn.on('pointerout', () => replayBtn.setFillStyle(0x1a3a5c));
  }
}
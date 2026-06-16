import Phaser from 'phaser';

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data) {
    this.score = data.score || 0;
    this.xpGained = data.xpGained || 0;
    this.newLevel = data.newLevel || parseInt(localStorage.getItem('playerLevel') || '1');
    this.newXP = data.newXP || parseInt(localStorage.getItem('playerXP') || '0');
    this.leveledUp = data.leveledUp || false;
    this.unlockText = data.unlockText || '';
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a1a);

    this.add.text(width / 2, height / 2 - 100, 'MATCH COMPLETE', {
      fontSize: '48px',
      fill: '#ffd700',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 50, `SCORE: ${this.score}`, {
      fontSize: '32px',
      fill: '#fff'
    }).setOrigin(0.5);

    // XP gained + new totals
    this.add.text(width / 2, height / 2, `+${this.xpGained} XP`, {
      fontSize: '26px',
      fill: '#4a90e2'
    }).setOrigin(0.5);

    // Level and XP bar
    this.add.text(width / 2, height / 2 + 40, `Level ${this.newLevel}  •  ${this.newXP} XP`, {
      fontSize: '20px',
      fill: '#ffd700'
    }).setOrigin(0.5);

    // Simple XP progress bar
    const barWidth = 200;
    const xpPercent = Math.min((this.newXP % 100) / 100, 1);
    this.add.rectangle(width / 2, height / 2 + 70, barWidth, 12, 0x333355).setOrigin(0.5);
    if (xpPercent > 0) {
      this.add.rectangle(width / 2 - barWidth / 2, height / 2 + 70, barWidth * xpPercent, 12, 0x4a90e2).setOrigin(0, 0.5);
    }

    if (this.leveledUp) {
      this.add.text(width / 2, height / 2 + 100, 'LEVEL UP!', {
        fontSize: '22px',
        fill: '#ffd700',
        fontStyle: 'bold'
      }).setOrigin(0.5);
    }

    if (this.unlockText) {
      this.add.text(width / 2, height / 2 + 125, this.unlockText, {
        fontSize: '16px',
        fill: '#a0c4ff'
      }).setOrigin(0.5);
    }

    const replayBtn = this.add.rectangle(width / 2, height / 2 + 170, 240, 50, 0x1a3a5c).setInteractive();
    this.add.text(width / 2, height / 2 + 170, 'PLAY AGAIN', {
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
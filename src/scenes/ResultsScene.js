import Phaser from 'phaser';

export default class ResultsScene extends Phaser.Scene {
  constructor() {
    super({ key: 'ResultsScene' });
  }

  init(data) {
    this.score = data.score || 0;
    this.xpGained = data.xpGained || 35;
  }

  create() {
    const { width, height } = this.cameras.main;

    this.add.text(width/2, 85, '⚡ MATCH COMPLETE ⚡', {
      fontSize: '52px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width/2, 160, `FINAL SCORE: ${this.score}`, {
      fontSize: '36px',
      fill: '#fff'
    }).setOrigin(0.5);

    this.add.text(width/2, 210, `+${this.xpGained} XP EARNED`, {
      fontSize: '26px',
      fill: '#2ecc71'
    }).setOrigin(0.5);

    // Progression calculation
    let currentLevel = parseInt(localStorage.getItem('orbchase_level') || '1');
    let currentXP = parseInt(localStorage.getItem('orbchase_xp') || '0');
    currentXP += this.xpGained;
    let leveledUp = false;
    while (currentXP >= 100) {
      currentLevel++;
      currentXP -= 100;
      leveledUp = true;
    }
    localStorage.setItem('orbchase_level', currentLevel);
    localStorage.setItem('orbchase_xp', currentXP);

    const progressBar = this.add.graphics();
    progressBar.fillStyle(0x2ecc71, 0.9);
    progressBar.fillRect(width/2 - 150, 280, (currentXP / 100) * 300, 18);
    progressBar.lineStyle(2, 0x4a90e2);
    progressBar.strokeRect(width/2 - 150, 280, 300, 18);

    this.add.text(width/2, 265, `LEVEL ${currentLevel}  •  ${currentXP}/100 XP`, {
      fontSize: '20px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    if (leveledUp) {
      this.add.text(width/2, 330, '🎉 LEVEL UP! New Arena + Skins Unlocked!', {
        fontSize: '22px',
        fill: '#ffd700'
      }).setOrigin(0.5);
    }

    // Unlocks display
    const unlocks = currentLevel >= 3 ? 'Orb Skin: Void + Dash Cooldown' : (currentLevel >= 6 ? 'All Arenas + Skins' : 'Keep playing for unlocks!');
    this.add.text(width/2, 380, `Unlocks: ${unlocks}`, {
      fontSize: '18px',
      fill: '#ffaa00'
    }).setOrigin(0.5);

    // Buttons
    const lobbyBtn = this.add.text(width/2 - 140, 460, 'LOBBY', {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#3498db',
      padding: { x: 28, y: 12 }
    }).setOrigin(0.5).setInteractive();

    const againBtn = this.add.text(width/2 + 140, 460, 'PLAY AGAIN', {
      fontSize: '24px',
      fill: '#fff',
      backgroundColor: '#e74c3c',
      padding: { x: 28, y: 12 }
    }).setOrigin(0.5).setInteractive();

    lobbyBtn.on('pointerdown', () => this.scene.start('LobbyScene'));
    againBtn.on('pointerdown', () => this.scene.start('GameScene', { roomCode: 'QUICK' + Date.now().toString().slice(-5), isHost: true, arenaLevel: 1 }));

    this.add.text(width/2, height - 45, 'OrbChase • Real-time Multiplayer 2D Fun • Built in 1 Day', {
      fontSize: '13px',
      fill: '#555'
    }).setOrigin(0.5);
  }
}
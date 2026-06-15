import Phaser from 'phaser';

export default class LobbyScene extends Phaser.Scene {
  constructor() {
    super({ key: 'LobbyScene' });
  }

  create() {
    const { width, height } = this.cameras.main;
    
    // Title with glow effect
    this.add.text(width / 2, 70, 'OR B C H A S E', {
      fontSize: '68px',
      fontStyle: 'bold',
      fill: '#4a90e2',
      stroke: '#0ff',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.add.text(width / 2, 125, '⚡ Fast-Paced 2D Multiplayer Arena ⚡', {
      fontSize: '22px',
      fill: '#a0c4ff'
    }).setOrigin(0.5);

    // Player level from storage
    const playerLevel = parseInt(localStorage.getItem('orbchase_level') || '1');
    this.add.text(width / 2, 175, `Your Level: ${playerLevel}  •  XP Progress Saved`, {
      fontSize: '16px',
      fill: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, 215, 'Create or Join a Room to Play', {
      fontSize: '26px',
      fill: '#fff'
    }).setOrigin(0.5);

    // Room input
    const roomInput = document.createElement('input');
    roomInput.type = 'text';
    roomInput.placeholder = 'Room Code (e.g. NEXUS42)';
    roomInput.style.position = 'absolute';
    roomInput.style.left = '50%';
    roomInput.style.top = '255px';
    roomInput.style.transform = 'translateX(-50%)';
    roomInput.style.padding = '14px 22px';
    roomInput.style.fontSize = '18px';
    roomInput.style.borderRadius = '10px';
    roomInput.style.border = '3px solid #4a90e2';
    roomInput.style.background = '#111122';
    roomInput.style.color = '#fff';
    roomInput.style.width = '300px';
    roomInput.style.textAlign = 'center';
    document.body.appendChild(roomInput);
    this.roomInputEl = roomInput;

    // Arena select buttons (level gated)
    const arenas = [
      { label: 'NEXUS 1 (Easy)', level: 1, color: '#2ecc71' },
      { label: 'VOID 2 (Medium)', level: 3, color: '#f39c12' },
      { label: 'CORE 3 (Hard)', level: 6, color: '#e74c3c' }
    ];

    arenas.forEach((arena, idx) => {
      const unlocked = playerLevel >= arena.level;
      const btnY = 340 + idx * 58;
      const btn = this.add.text(width / 2, btnY, arena.label + (unlocked ? '' : ' 🔒'), {
        fontSize: '20px',
        fill: unlocked ? '#fff' : '#888',
        backgroundColor: unlocked ? arena.color : '#333',
        padding: { x: 24, y: 10 }
      }).setOrigin(0.5).setInteractive();

      btn.on('pointerdown', () => {
        if (!unlocked) {
          alert(`Reach Level ${arena.level} to unlock this arena!`);
          return;
        }
        const code = roomInput.value.trim() || 'NEXUS' + Math.floor(Math.random() * 9999);
        document.body.removeChild(roomInput);
        this.scene.start('GameScene', { roomCode: code, isHost: true, arenaLevel: arena.level });
      });
    });

    // Quick play
    const quickBtn = this.add.text(width / 2, height - 70, 'QUICK MATCH (Arena 1)', {
      fontSize: '18px',
      fill: '#fff',
      backgroundColor: '#9b59b6',
      padding: { x: 18, y: 8 }
    }).setOrigin(0.5).setInteractive();

    quickBtn.on('pointerdown', () => {
      const code = roomInput.value.trim() || 'QUICK' + Date.now().toString().slice(-4);
      if (this.roomInputEl && this.roomInputEl.parentNode) document.body.removeChild(this.roomInputEl);
      this.scene.start('GameScene', { roomCode: code, isHost: true, arenaLevel: 1 });
    });
  }

  shutdown() {
    if (this.roomInputEl && this.roomInputEl.parentNode) {
      this.roomInputEl.parentNode.removeChild(this.roomInputEl);
    }
  }
}
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
    this.add.text(width / 2, 55, 'MULTIPLAYER LOBBY  •  7/10 PLAYERS', {
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

    // Quick action buttons under preview
    const btnY = previewY + 145;
    const quickBtn = this.add.rectangle(centerX, btnY, 260, 42, 0x1a5a3c).setInteractive();
    this.add.text(centerX, btnY, '⚡ QUICK MATCH', {
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

    const rowY = btnY + 52;
    const createBtn = this.add.rectangle(centerX - 95, rowY, 170, 36, 0x1a3a5c).setInteractive();
    this.add.text(centerX - 95, rowY, 'CREATE ROOM', { fontSize: '15px', fill: '#fff' }).setOrigin(0.5);
    createBtn.on('pointerdown', () => {
      const roomCode = 'ROOM-' + Date.now().toString().slice(-4);
      const pName = localStorage.getItem('playerName') || 'Player';
      this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
    });
    createBtn.on('pointerover', () => createBtn.setFillStyle(0x2a5a8c));
    createBtn.on('pointerout', () => createBtn.setFillStyle(0x1a3a5c));

    const joinBtn = this.add.rectangle(centerX + 95, rowY, 170, 36, 0x1a3a5c).setInteractive();
    this.add.text(centerX + 95, rowY, 'JOIN ROOM', { fontSize: '15px', fill: '#fff' }).setOrigin(0.5);
    joinBtn.on('pointerdown', () => this.enterJoinMode());
    joinBtn.on('pointerover', () => joinBtn.setFillStyle(0x2a5a8c));
    joinBtn.on('pointerout', () => joinBtn.setFillStyle(0x1a3a5c));

    // === RIGHT SIDEBAR: MATCH INFO (reference exact) ===
    const rightX = width - 135;
    const rightWidth = 230;

    this.add.rectangle(rightX, sidebarTop + sidebarHeight / 2, rightWidth, sidebarHeight, 0x0d0d1f).setStrokeStyle(2, 0x4a90e2);

    this.add.text(rightX, sidebarTop - 18, 'MATCH INFO', {
      fontSize: '13px',
      fill: '#4a90e2',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const infoStartY = sidebarTop + 22;
    const lineH = 26;

    const infoItems = [
      { label: 'Mode', value: 'Classic Orb Chase' },
      { label: 'Arena', value: 'Neon Nexus' },
      { label: 'Round Time', value: '4:00' },
      { label: 'Power-Ups', value: 'ON' },
      { label: 'Players', value: '7 / 10' }
    ];
    infoItems.forEach((item, idx) => {
      const y = infoStartY + idx * lineH;
      this.add.text(rightX - 75, y, item.label, { fontSize: '12px', fill: '#888' }).setOrigin(0, 0.5);
      const valColor = item.label === 'Players' ? '#4ade80' : '#fff';
      this.add.text(rightX + 35, y, item.value, { fontSize: '13px', fill: valColor }).setOrigin(0, 0.5);
    });

    // Change Settings button (disabled look for non-host demo)
    const settingsBtn = this.add.rectangle(rightX, infoStartY + 5 * lineH + 10, 160, 30, 0x2a2a3a).setInteractive();
    this.add.text(rightX, infoStartY + 5 * lineH + 10, 'Change Settings', {
      fontSize: '12px',
      fill: '#666'
    }).setOrigin(0.5);
    settingsBtn.on('pointerover', () => settingsBtn.setFillStyle(0x3a3a4a));
    settingsBtn.on('pointerout', () => settingsBtn.setFillStyle(0x2a2a3a));
    // Note for non-host
    this.add.text(rightX, infoStartY + 5 * lineH + 38, '(Host only)', {
      fontSize: '10px',
      fill: '#555'
    }).setOrigin(0.5);

    // === BOTTOM: CHAT + READY UP (reference layout) ===
    const chatY = height - 95;
    const chatPanelX = 280;

    // Chat panel background
    this.add.rectangle(chatPanelX, chatY, 420, 70, 0x0d0d1f).setStrokeStyle(1, 0x4a90e2);

    // Sample chat messages (reference style)
    this.add.text(chatPanelX - 195, chatY - 22, 'NeonNinja: Ready to chase some orbs 😎', {
      fontSize: '11px', fill: '#a0c4ff'
    }).setOrigin(0, 0.5);
    this.add.text(chatPanelX - 195, chatY - 6, 'OrbWhisper: Anyone want to team up?', {
      fontSize: '11px', fill: '#a0c4ff'
    }).setOrigin(0, 0.5);
    this.add.text(chatPanelX - 195, chatY + 10, 'PixelProwler: This map is so fun lol', {
      fontSize: '11px', fill: '#a0c4ff'
    }).setOrigin(0, 0.5);

    // Chat input
    this.chatInputText = this.add.text(chatPanelX - 195, chatY + 28, 'Type a message...', {
      fontSize: '11px', fill: '#666', fontStyle: 'italic'
    }).setOrigin(0, 0.5);
    this.chatInputActive = false;

    // Send button
    const sendBtn = this.add.rectangle(chatPanelX + 175, chatY + 28, 50, 22, 0x1a3a5c).setInteractive();
    this.add.text(chatPanelX + 175, chatY + 28, 'Send', { fontSize: '11px', fill: '#fff' }).setOrigin(0.5);
    sendBtn.on('pointerdown', () => this.sendChatMessage());

    // READY UP button (prominent, reference green)
    const readyBtn = this.add.rectangle(width - 135, chatY + 5, 170, 48, 0x16a34a).setInteractive();
    this.add.text(width - 135, chatY + 5, '🚀 READY UP', {
      fontSize: '18px',
      fill: '#fff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    readyBtn.on('pointerdown', () => {
      readyBtn.setFillStyle(0x15803d);
      this.add.text(width - 135, chatY + 32, 'Waiting for players...', {
        fontSize: '11px', fill: '#4ade80'
      }).setOrigin(0.5);
      // After short delay, start the game (demo)
      this.time.delayedCall(900, () => {
        const roomCode = 'LOBBY-' + Date.now().toString().slice(-5);
        const pName = localStorage.getItem('playerName') || 'Player';
        this.scene.start('GameScene', { roomCode, isHost: true, arenaLevel: 1, playerName: pName });
      });
    });
    readyBtn.on('pointerover', () => readyBtn.setFillStyle(0x22c55e));
    readyBtn.on('pointerout', () => readyBtn.setFillStyle(0x16a34a));

    // Footer controls hint
    this.add.text(width / 2, height - 22, 'WASD/Arrows Move  •  SPACE Dash  •  Collect Orbs  •  Dodge Hazards', {
      fontSize: '11px',
      fill: '#555'
    }).setOrigin(0.5);

    // Keyboard support for chat (simple)
    this.input.keyboard.on('keydown', (event) => {
      if (this.chatInputActive) {
        if (event.key === 'Enter') {
          this.sendChatMessage();
        } else if (event.key === 'Backspace') {
          this.chatInputText.setText(this.chatInputText.text.slice(0, -1) || 'Type a message...');
        } else if (event.key.length === 1) {
          const current = this.chatInputText.text === 'Type a message...' ? '' : this.chatInputText.text;
          this.chatInputText.setText(current + event.key);
        }
      } else if (event.key.toLowerCase() === 'c') {
        this.chatInputActive = true;
        this.chatInputText.setText('');
        this.chatInputText.setStyle({ fill: '#fff', fontStyle: 'normal' });
      }
    });
  }

  sendChatMessage() {
    if (!this.chatInputText || this.chatInputText.text === 'Type a message...' || this.chatInputText.text.trim() === '') return;
    // For demo: just clear and show "sent"
    const sentMsg = this.chatInputText.text;
    this.chatInputText.setText('Message sent!');
    this.chatInputActive = false;
    this.time.delayedCall(1200, () => {
      if (this.chatInputText) {
        this.chatInputText.setText('Type a message...');
        this.chatInputText.setStyle({ fill: '#666', fontStyle: 'italic' });
      }
    });
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
import { io } from 'socket.io-client';

export default class SocketManager {
  constructor(scene) {
    this.scene = scene;
    // For local dev: use localhost, for deployed use Render URL
    // Deploy: Change the production URL to your Render service URL after deploying the server
this.socket = io(window.location.hostname === 'localhost' ? 'http://localhost:3001' : 'https://orbchase-server.onrender.com');
    
    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
    });

    this.socket.on('roomJoined', (data) => {
      console.log('Joined room:', data);
      if (this.scene.onRoomJoined) this.scene.onRoomJoined(data);
    });

    this.socket.on('playerJoined', (data) => {
      if (this.scene.onPlayerJoined) this.scene.onPlayerJoined(data);
    });

    this.socket.on('playerMoved', (data) => {
      if (this.scene.onPlayerMoved) this.scene.onPlayerMoved(data);
    });

    this.socket.on('playerDashed', (data) => {
      if (this.scene.onPlayerDashed) this.scene.onPlayerDashed(data);
    });

    this.socket.on('orbCollected', (data) => {
      if (this.scene.onOrbCollected) this.scene.onOrbCollected(data);
    });
  }

  joinRoom(roomCode, playerName = 'Player') {
    this.socket.emit('joinRoom', { roomCode, playerName });
  }

  sendMove(roomCode, x, y, vx, vy) {
    this.socket.emit('playerMove', { roomCode, x, y, vx, vy });
  }

  sendDash(roomCode, x, y) {
    this.socket.emit('dash', { roomCode, x, y });
  }

  sendCollect(roomCode, orbId) {
    this.socket.emit('collectOrb', { roomCode, orbId });
  }

  disconnect() {
    this.socket.disconnect();
  }
}
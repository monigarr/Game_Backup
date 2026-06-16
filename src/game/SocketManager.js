import { io } from 'socket.io-client';

export default class SocketManager {
  constructor(scene) {
    this.scene = scene;
    this.socket = null;
    this.connected = false;

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    // Production: update this to your actual Render URL after first backend deploy
    const PROD_SERVER_URL = 'https://orbchase-server.onrender.com';
    const serverUrl = isLocal ? 'http://localhost:3001' : PROD_SERVER_URL;

    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      this.connected = true;
      console.log('[SocketManager] Connected to server');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      console.log('[SocketManager] Disconnected from server');
    });

    // Wire server events to scene callbacks
    this.socket.on('roomJoined', (data) => {
      if (this.scene.onRoomJoined) this.scene.onRoomJoined(data);
    });

    this.socket.on('playerJoined', (data) => {
      if (this.scene.onPlayerJoined) this.scene.onPlayerJoined(data);
    });

    this.socket.on('playerLeft', (data) => {
      if (this.scene.onPlayerLeft) this.scene.onPlayerLeft(data);
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

  joinRoom(roomCode, playerName) {
    if (this.socket && this.connected) {
      this.socket.emit('joinRoom', { roomCode, playerName });
    } else {
      // Fallback for offline / server not running
      if (this.scene.onRoomJoined) {
        this.scene.onRoomJoined({ players: [] });
      }
      console.log('[SocketManager] Server unavailable - running in offline mode');
    }
  }

  sendMove(roomCode, x, y, vx, vy) {
    if (this.socket && this.connected) {
      this.socket.emit('playerMove', { roomCode, x, y, vx, vy });
    }
  }

  sendDash(roomCode, x, y) {
    if (this.socket && this.connected) {
      this.socket.emit('playerDash', { roomCode, x, y });
    }
  }

  sendCollect(roomCode, orbId) {
    if (this.socket && this.connected) {
      this.socket.emit('orbCollected', { roomCode, orbId });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connected = false;
  }
}
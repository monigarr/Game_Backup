export default class SocketManager {
  constructor(scene) {
    this.scene = scene;
    this.socket = null;
    this.connected = false;
  }

  joinRoom(roomCode, playerName) {
    // Offline mode: simulate immediate room join
    this.connected = true;
    if (this.scene.onRoomJoined) {
      this.scene.onRoomJoined({ players: [] });
    }
    console.log('[SocketManager] Offline mode - joined room:', roomCode);
  }

  sendMove(roomCode, x, y, vx, vy) {
    // No-op in offline mode
  }

  sendDash(roomCode, x, y) {
    if (this.scene.onPlayerDashed) {
      this.scene.onPlayerDashed({ id: 'local' });
    }
  }

  sendCollect(roomCode, orbId) {
    if (this.scene.onOrbCollected) {
      this.scene.onOrbCollected({ orbId, score: null });
    }
  }

  disconnect() {
    this.connected = false;
    console.log('[SocketManager] Disconnected (offline mode)');
  }
}
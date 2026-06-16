const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory room state: roomCode -> { players: Map<id, {id, name, x, y}>, orbs: Set }
const rooms = new Map();

function getOrCreateRoom(roomCode) {
  if (!rooms.has(roomCode)) {
    rooms.set(roomCode, {
      players: new Map(),
      orbs: new Set()
    });
  }
  return rooms.get(roomCode);
}

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    const room = getOrCreateRoom(roomCode);
    socket.join(roomCode);

    const player = {
      id: socket.id,
      name: playerName || 'Player',
      x: 450,
      y: 350
    };
    room.players.set(socket.id, player);

    // Send current players to the new player
    const playersList = Array.from(room.players.values());
    socket.emit('roomJoined', { roomCode, players: playersList });

    // Notify others
    socket.to(roomCode).emit('playerJoined', { id: socket.id, name: player.name, x: player.x, y: player.y });

    console.log(`${player.name} joined room ${roomCode}`);
  });

  socket.on('playerMove', ({ roomCode, x, y, vx, vy }) => {
    const room = rooms.get(roomCode);
    if (!room) return;

    const player = room.players.get(socket.id);
    if (player) {
      player.x = x;
      player.y = y;
    }

    socket.to(roomCode).emit('playerMoved', {
      id: socket.id,
      x,
      y,
      vx,
      vy
    });
  });

  socket.on('playerDash', ({ roomCode, x, y }) => {
    socket.to(roomCode).emit('playerDashed', { id: socket.id, x, y });
  });

  socket.on('orbCollected', ({ roomCode, orbId }) => {
    const room = rooms.get(roomCode);
    if (room) {
      room.orbs.add(orbId);
    }
    socket.to(roomCode).emit('orbCollected', { id: socket.id, orbId });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);

    // Remove from all rooms
    for (const [roomCode, room] of rooms.entries()) {
      if (room.players.has(socket.id)) {
        room.players.delete(socket.id);
        io.to(roomCode).emit('playerLeft', { id: socket.id });

        // Clean up empty rooms
        if (room.players.size === 0) {
          rooms.delete(roomCode);
        }
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`OrbChase server running on port ${PORT}`);
});
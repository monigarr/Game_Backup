const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// In-memory rooms for MVP
const rooms = new Map();

app.get('/health', (req, res) => {
  res.json({ status: 'ok', rooms: rooms.size });
});

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('joinRoom', ({ roomCode, playerName }) => {
    socket.join(roomCode);
    if (!rooms.has(roomCode)) {
      rooms.set(roomCode, { players: new Map(), orbs: 8, startTime: Date.now() });
    }
    const room = rooms.get(roomCode);
    room.players.set(socket.id, { id: socket.id, x: 450, y: 350, score: 0, level: 1 });

    socket.emit('roomJoined', { roomCode, players: Array.from(room.players.values()) });
    socket.to(roomCode).emit('playerJoined', { id: socket.id, x: 450, y: 350 });

    console.log(`Player ${socket.id} joined room ${roomCode}`);
  });

  socket.on('playerMove', ({ roomCode, x, y, vx, vy }) => {
    const room = rooms.get(roomCode);
    if (room && room.players.has(socket.id)) {
      const p = room.players.get(socket.id);
      p.x = x; p.y = y;
      socket.to(roomCode).emit('playerMoved', { id: socket.id, x, y, vx, vy });
    }
  });

  socket.on('dash', ({ roomCode, x, y }) => {
    socket.to(roomCode).emit('playerDashed', { id: socket.id, x, y });
  });

  socket.on('collectOrb', ({ roomCode, orbId }) => {
    const room = rooms.get(roomCode);
    if (room) {
      const p = room.players.get(socket.id);
      if (p) p.score += 10;
      socket.to(roomCode).emit('orbCollected', { id: socket.id, orbId, score: p.score });
    }
  });

  socket.on('disconnect', () => {
    console.log('Player disconnected:', socket.id);
    // Clean up rooms logic would go here in full version
  });
});

server.listen(PORT, () => {
  console.log(`OrbChase server running on port ${PORT}`);
});
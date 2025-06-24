const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const ACTIONS = require('./src/Actions');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "https://syn-code-one.vercel.app/"],
    methods: ["GET", "POST"]
  }
});

// Store users by socketId, not globally
const userSocketMap = {}; // { socketId: username }
const roomUsers = {};     // { roomId: [{ socketId, username }] }
const roomLanguages = {};

function getAllConnectedClients(roomId) {
  const room = io.sockets.adapter.rooms.get(roomId);
  if (!room) return [];
  
  return Array.from(room).map(socketId => ({
    socketId,
    username: userSocketMap[socketId] || 'Anonymous'
  }));
}

// Check if username is already taken in a room
function isUsernameAvailable(roomId, username, excludeSocketId = null) {
  const clients = getAllConnectedClients(roomId);
  return !clients.some(client => 
    client.username === username && client.socketId !== excludeSocketId
  );
}

io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    // Check if username is already taken in this room
    if (!isUsernameAvailable(roomId, username)) {
      socket.emit('username_taken', { 
        message: `Username "${username}" is already taken in this room.` 
      });
      return;
    }

    // Store username for this specific socket
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    // Initialize room language if not set
    if (!roomLanguages[roomId]) {
      roomLanguages[roomId] = 'javascript';
    }

    console.log(`${username} (${socket.id}) joined room ${roomId}`);

    const clients = getAllConnectedClients(roomId);
    
    // Notify all clients in the room
    clients.forEach(({ socketId }) => {
      io.to(socketId).emit(ACTIONS.JOINED, {
        clients,
        username,
        socketId: socket.id,
        currentLanguage: roomLanguages[roomId],
      });
    });
  });

  // Rest of your socket handlers...
  socket.on(ACTIONS.CODE_CHANGE, ({ roomId, code }) => {
    socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on(ACTIONS.SYNC_CODE, ({ socketId, code }) => {
    io.to(socketId).emit(ACTIONS.CODE_CHANGE, { code });
  });

  socket.on('language_change', ({ roomId, language, username }) => {
    roomLanguages[roomId] = language;
    socket.in(roomId).emit('language_change', { language, username });
  });

  socket.on('disconnecting', () => {
    const username = userSocketMap[socket.id];
    const rooms = [...socket.rooms];
    
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) { // Skip the socket's own room
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: username,
        });

        // Clean up room if empty
        const remainingClients = getAllConnectedClients(roomId);
        if (remainingClients.length <= 1) {
          delete roomLanguages[roomId];
        }
      }
    });
    
    // Clean up user data
    delete userSocketMap[socket.id];
    console.log(`${username} (${socket.id}) disconnected`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

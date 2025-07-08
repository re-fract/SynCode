const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors'); // Add this import
const ACTIONS = require('./src/Actions');

// Enable detailed logging
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Import your code execution service
const { executeCode } = require('./src/services/codeExecution');

const server = http.createServer(app);

// ✅ Enhanced CORS configuration for Express
const corsOptions = {
  origin: [
    "http://localhost:3000",
    "http://127.0.0.1:3000", // Add this for local variations
    "https://syn-code-one.vercel.app",
    "https://syncode-p2yq.onrender.com", // Add your Render URL
    /^https:\/\/.*\.onrender\.com$/, // Allow all render.com subdomains
    /^https:\/\/.*\.vercel\.app$/ // Allow all vercel.app subdomains
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// ✅ Apply CORS middleware BEFORE other middleware
app.use(cors(corsOptions));

// ✅ Handle preflight requests for all routes
app.options('*', cors(corsOptions));

// ✅ Add Express middleware for parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000",
      "https://syn-code-one.vercel.app",
      "https://syncode-p2yq.onrender.com",
      /^https:\/\/.*\.onrender\.com$/,
      /^https:\/\/.*\.vercel\.app$/
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling'], // Allow both transports for better compatibility
  pingTimeout: 60000, // Increase ping timeout for slower connections
  pingInterval: 25000, // Increase ping interval
  upgradeTimeout: 30000, // Increase upgrade timeout
  allowEIO3: true // Allow older socket.io versions
});

// Store users by socketId, not globally
const userSocketMap = {}; // { socketId: username }
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

// ✅ Health check routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'SynCode Server is running!', 
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

app.get('/health', (req, res) => {
  const healthCheck = {
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
    },
    activeConnections: io.engine.clientsCount || 0,
    activeRooms: Object.keys(roomLanguages).length,
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.json(healthCheck);
});

// ✅ Code execution API route with enhanced error handling
app.post('/api/execute', async (req, res) => {
  // Add CORS headers explicitly for this route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    console.log('Received execute request:', req.body);
    const { code, language, input } = req.body; // ✅ ADD INPUT HERE!
    
    // Validate input
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        error: 'Code and language are required',
        output: 'Error: Missing code or language parameter'
      });
    }

    // Validate language
    const supportedLanguages = ['javascript', 'python', 'java', 'cpp', 'html', 'css'];
    if (!supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        error: `Language '${language}' is not supported`,
        output: `Error: Unsupported language '${language}'. Supported languages: ${supportedLanguages.join(', ')}`
      });
    }

    console.log(`Code execution request: ${language} (${code.length} characters)`);
    console.log('Input parameter:', JSON.stringify(input)); // ✅ ADD INPUT LOGGING
    
    // Execute code using your existing service
    const result = await executeCode(language, code, input); // ✅ PASS INPUT PARAMETER!
    
    console.log('Execution result:', result);
    
    if (result.success) {
      res.json({
        success: true,
        output: result.output,
        error: result.error || null,
        isPreview: result.isPreview || false,
        htmlContent: result.htmlContent || null,
        exitCode: result.exitCode || 0
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error,
        output: result.output
      });
    }
  } catch (error) {
    console.error('Code execution error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      output: `Server error: ${error.message}`
    });
  }
});

// ✅ Handle preflight for execute route specifically
app.options('/api/execute', cors(corsOptions));

// ✅ API route to get supported languages
app.get('/api/languages', (req, res) => {
  res.json({
    languages: [
      { id: 'javascript', name: 'JavaScript', extension: 'js' },
      { id: 'python', name: 'Python', extension: 'py' },
      { id: 'java', name: 'Java', extension: 'java' },
      { id: 'cpp', name: 'C++', extension: 'cpp' },
      { id: 'html', name: 'HTML', extension: 'html' },
      { id: 'css', name: 'CSS', extension: 'css' }
    ]
  });
});

// Socket.io connection handling (rest of your existing code)
io.on('connection', (socket) => {
  console.log('Socket connected:', socket.id);
  console.log('User agent:', socket.handshake.headers['user-agent']);
  console.log('Origin:', socket.handshake.headers.origin);

  socket.on(ACTIONS.JOIN, ({ roomId, username }) => {
    console.log(`Join attempt: ${username} -> room ${roomId}`);
    
    // Validate input
    if (!roomId || !username) {
      console.log('Invalid join attempt - missing roomId or username');
      socket.emit('join_error', { message: 'Room ID and username are required' });
      return;
    }
    
    // Check if username is already taken in this room
    if (!isUsernameAvailable(roomId, username)) {
      console.log(`Username ${username} already taken in room ${roomId}`);
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

    console.log(`${username} (${socket.id}) successfully joined room ${roomId}`);

    const clients = getAllConnectedClients(roomId);
    
    // Emit to the entire room
    io.to(roomId).emit(ACTIONS.JOINED, {
      clients,
      username,
      socketId: socket.id,
      currentLanguage: roomLanguages[roomId],
    });
  });

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
    
    console.log(`${username} (${socket.id}) disconnecting from rooms:`, rooms);
    
    rooms.forEach((roomId) => {
      if (roomId !== socket.id) { // Skip the socket's own room
        socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
          socketId: socket.id,
          username: username,
        });

        // Clean up room language if empty
        setTimeout(() => {
          const remainingClients = getAllConnectedClients(roomId);
          if (remainingClients.length === 0) {
            delete roomLanguages[roomId];
            console.log(`Cleaned up empty room: ${roomId}`);
          }
        }, 1000);
      }
    });
    
    // Clean up user data
    delete userSocketMap[socket.id];
    console.log(`${username} (${socket.id}) disconnected and cleaned up`);
  });

  socket.on('disconnect', (reason) => {
    console.log('Socket disconnected:', socket.id, 'Reason:', reason);
    
    // Log additional disconnection info
    if (reason === 'client namespace disconnect') {
      console.log('Client initiated disconnect');
    } else if (reason === 'server namespace disconnect') {
      console.log('Server initiated disconnect');
    } else if (reason === 'transport close') {
      console.log('Transport connection closed');
    } else if (reason === 'transport error') {
      console.log('Transport error occurred');
    }
  });

  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connect error:', error);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ SynCode Server running on port ${PORT}`);
  console.log(`✅ CORS enabled for: localhost:3000, syn-code-one.vercel.app, syncode-p2yq.onrender.com`);
  console.log(`✅ API routes available:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/execute`);
  console.log(`   - GET  /api/languages`);
  console.log(`✅ Socket.io configured with websocket and polling transports`);
});

import { io } from 'socket.io-client';

export const initSocket = async () => {
  const options = {
    'force new connection': true,
    reconnectionAttempts: 5, // Limit reconnection attempts
    reconnectionDelay: 1000, // Start with 1 second delay
    reconnectionDelayMax: 5000, // Max 5 seconds between attempts
    maxReconnectionAttempts: 5,
    timeout: 20000,
    transports: ['websocket', 'polling'], // Allow both transports
    upgrade: true, // Allow transport upgrades
    forceNew: true,
    autoConnect: true,
    query: {
      transport: 'websocket'
    }
  };

  // Use environment variable for backend URL
  const serverUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
  console.log('Connecting to server:', serverUrl);
  
  return io(serverUrl, options);
};

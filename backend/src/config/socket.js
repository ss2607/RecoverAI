const { Server } = require('socket.io');
const authService = require('../services/authService');

let io = null;

const initSocket = (server) => {
  const origins = [
    "http://localhost:5173",
    "http://localhost:5174"
  ];
  if (process.env.FRONTEND_URL) {
    origins.push(process.env.FRONTEND_URL);
  }

  io = new Server(server, {
    cors: {
      origin: origins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  });

  // JWT Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }
    try {
      const decoded = authService.verifyToken(token);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user?.id;
    if (userId) {
      const roomName = `user:${userId}`;
      socket.join(roomName);
      console.log(`Socket connection: User ${userId} joined room ${roomName} (Socket ID: ${socket.id})`);
    }

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id} (User: ${userId})`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized yet!');
  }
  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    const roomName = `user:${userId}`;
    io.to(roomName).emit(event, data);
    console.log(`Emitted event "${event}" to room "${roomName}"`);
  }
};

const broadcast = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`Broadcasted event "${event}" to all connected clients`);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  broadcast
};

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
    console.log(`[SERVER] Client connected. Socket ID: ${socket.id}, User ID: ${userId}`);
    if (userId) {
      const roomName = `user:${userId}`;
      socket.join(roomName);
      console.log(`[SERVER] User ${userId} joined room ${roomName} (Socket ID: ${socket.id})`);
    }

    socket.on('join_conversation', ({ conversationId }) => {
      const roomName = `conversation:${conversationId}`;
      socket.join(roomName);
      const roomMembers = io.sockets.adapter.rooms.get(roomName);
      console.log(`[SERVER] Client ${socket.id} (User ${userId}) joined room ${roomName}. Current room members:`, roomMembers ? Array.from(roomMembers) : []);
    });

    socket.on('send_message', ({ conversationId, message }) => {
      const roomName = `conversation:${conversationId}`;
      console.log(`[SERVER] send_message received for room ${roomName} from ${socket.id}. Message text: "${message.text}"`);
      socket.to(roomName).emit('receive_message', { conversationId, message });
      console.log(`[SERVER] receive_message emitted to room ${roomName} (except sender)`);
    });

    socket.on('typing', ({ conversationId, isTyping }) => {
      const roomName = `conversation:${conversationId}`;
      socket.to(roomName).emit('typing', { conversationId, userId, isTyping });
    });

    socket.on('message_read', ({ conversationId, messageId }) => {
      const roomName = `conversation:${conversationId}`;
      socket.to(roomName).emit('message_read', { conversationId, messageId });
    });

    socket.on('meeting_updated', ({ conversationId, meetingLocation, meetingTime, meetingStatus }) => {
      const roomName = `conversation:${conversationId}`;
      socket.to(roomName).emit('meeting_updated', { conversationId, meetingLocation, meetingTime, meetingStatus });
    });

    socket.on('disconnect', () => {
      console.log(`[SERVER] Client disconnected: ${socket.id} (User: ${userId})`);
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

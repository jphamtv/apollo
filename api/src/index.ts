// Server entry point - sets up HTTP server with Socket.io integration for real-time messaging
import app from './app';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifySocketToken } from './middleware/socketMiddleware';
import { initializeSocketService } from './services/socketService';
import { registerHandlers } from './sockets/socketHandlers';
import { corsOptionsBase } from './config/corsConfig';
import { logger } from './utils/logger';
import dotenv from 'dotenv';
dotenv.config();

const httpServer = createServer(app);

// Initialize Socket.io with CORS settings matching Express CORS configuration
export const io = new Server(httpServer, {
  cors: {
    ...corsOptionsBase,
    methods: ['GET', 'POST'],
  },
});

// Initialize socket service
initializeSocketService(io);

// Apply authentication middleware
io.use(verifySocketToken);

// Set up event handlers
io.on('connection', socket => {
  logger.info(`User connected: ${socket.id}`);
  
  // Join user to their personal room for direct user-specific events
  const userId = socket.data.user.id;
  socket.join(userId);
  
  // Register all event handlers
  registerHandlers(io, socket);
  
  socket.on('disconnect', () => {
    logger.info(`User disconnected ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

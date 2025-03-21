import app from "./app";
import { createServer } from 'http';
import { Server } from 'socket.io';
import { verifySocketToken } from './middleware/socketMiddleware';
import { initializeSocketService } from "./services/socketService";
import { registerHandlers } from "./sockets/socketHandlers";
import { logger } from "./utils/logger";

const PORT = process.env.PORT || 3000;
const httpServer = createServer(app);

// Initialize Socket.io with CORS settings
export const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  }
});

// Initialize socket service
initializeSocketService(io);

// Apply authentication middleware
io.use(verifySocketToken);

// Set up event handlers
io.on('connection', (socket) => {
  logger.info(`User connected: ${socket.id}`);

  // Join user to their personal room 
  const userId = socket.data.user.id;
  socket.join(userId);

  // Register all event handlers
  registerHandlers(io, socket);

  socket.on('disconnect', () => {
    logger.info(`User disconnected ${socket.id}`);
  });
});

httpServer.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

import { Server, Socket } from 'socket.io';
import { EVENTS } from './socketEvents';
import { logger } from '../utils/logger';

/**
 * Registers socket event handlers for a connected client
 * Sets up handlers for joining/leaving rooms and typing indicators
 *
 * @param io - Socket.io server instance
 * @param socket - Individual client socket connection with user data attached
 */
export const registerHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;

  // Join conversation room
  socket.on(EVENTS.CONVERSATION_JOIN, conversationId => {
    socket.join(conversationId);
    logger.info(`User ${userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on(EVENTS.CONVERSATION_LEAVE, conversationId => {
    socket.leave(conversationId);
    logger.info(`User ${userId} left conversation ${conversationId}`);
  });

  // Typing indicators
  socket.on(EVENTS.TYPING_START, conversationId => {
    socket
      .to(conversationId)
      .emit(EVENTS.TYPING_START, { userId, conversationId });
  });

  socket.on(EVENTS.TYPING_STOP, conversationId => {
    socket
      .to(conversationId)
      .emit(EVENTS.TYPING_STOP, { userId, conversationId });
  });
};

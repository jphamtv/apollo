import { Server, Socket } from 'socket.io';
import { EVENTS } from './socketEvents';

export const registerHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.user.id;

  // Join conversation room
  socket.on(EVENTS.CONVERSATION_JOIN, (conversationId) => {
    socket.join(conversationId);
    console.log(`User ${userId} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on(EVENTS.CONVERSATION_LEAVE, (conversationId) => {
    socket.leave(conversationId);
    console.log(`User ${userId} left conversation ${conversationId}`);
  });

  // Typing indicators
  socket.on(EVENTS.TYPING_START, (conversationId) => {
    socket.to(conversationId).emit(EVENTS.TYPING_START, { userId, conversationId});
  });

  socket.on(EVENTS.TYPING_STOP, (conversationId) => {
    socket.to(conversationId).emit(EVENTS.TYPING_STOP, { userId, conversationId});
  });
};
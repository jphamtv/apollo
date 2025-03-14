import { Server } from 'socket.io';
import { EVENTS } from '../sockets/socketEvents';
import { MessageWithDetails } from '../types';

let io: Server;

export const initializeSocketService = (socketServer: Server) => {
  io = socketServer;
};

// Core notification methods
export const notifyNewMessage = (message: MessageWithDetails, conversationId: string, senderId: string) => {
  // Notify everyone in the conversation EXCEPT sender
  io.to(conversationId).except(senderId).emit(EVENTS.MESSAGE_RECEIVE, message);
};

export const notifyMessageRead = (conversationId: string, userId: string) => {
  io.to(conversationId).emit(EVENTS.MESSAGE_READ, {
    conversationId,
    userId
  });
};

// Typing indicators
export const notifyTypingStarted = (userId: string, conversationId: string) => {
  io.to(conversationId).emit(EVENTS.TYPING_START, { userId, conversationId });
};

export const notifyTypingStopped = (userId: string, conversationId: string) => {
  io.to(conversationId).emit(EVENTS.TYPING_STOP, { userId, conversationId });
};

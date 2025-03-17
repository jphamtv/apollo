import { createContext } from 'react';
import { Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  typingUsers: Record<string, string[]>; // conversationId -> array of userIds typing
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  typingUsers: {},
});

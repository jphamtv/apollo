import { io, Socket } from 'socket.io-client';

export const EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  MESSAGE_SEND: 'message:send',
  MESSAGE_RECEIVE: 'message:receive',
  MESSAGE_READ: 'message:read',

  TYPING_START: 'typing:start',
  TYPING_STOP: 'typing:stop',

  CONVERSATION_JOIN: 'conversation:join',
  CONVERSATION_LEAVE: 'conversation:leave',

  NOTIFICATION_NEW: 'notification:new',
  NOTIFICATION_READ: 'notification:read'
};

let socket: Socket | null = null;

const getServerUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
}

// Initialize socket connection with authentication
export const initializeSocket = (token: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  const serverUrl = getServerUrl();
  console.log('Connecting to Socket.io server at: ', serverUrl);
  
  // Connect to the socket server with authentication token
  socket = io(serverUrl, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
  });

  // Setup basic event handlers
  socket.on(EVENTS.CONNECT, () => {
    console.log('Socket connected: ', socket?.id);
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error: ', error.message);
  });

  socket.on(EVENTS.DISCONNECT, (reason) => {
    console.log('Socket disconnected: ', reason);
  });

  return socket;
};

// Get the current socket instance
export const getSocket = (): Socket | null => socket;

// Join a specific conversation room
export const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit(EVENTS.CONVERSATION_JOIN, conversationId);
  }
};

// Send typing indicator start
export const startTyping = (conversationId: string) => {
  if (socket) {
    socket.emit(EVENTS.TYPING_START, conversationId);
  }
};

// Send typing indicator stop
export const stopTyping = (conversationId: string) => {
  if (socket) {
    socket.emit(EVENTS.TYPING_STOP, conversationId);
  }
};

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
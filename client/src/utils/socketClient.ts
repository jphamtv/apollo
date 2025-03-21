import { io, Socket } from 'socket.io-client';

/**
 * Socket.io event constants used for communication between client and server
 */
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

/**
 * Initializes a Socket.io connection with authentication token
 * Sets up base event handlers and returns the socket instance
 * @param token - JWT auth token
 * @returns Socket instance
 */
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
    if (import.meta.env.DEV) {
      console.log('Socket connected: ', socket?.id);
    }
  });

  socket.on('connect_error', (error) => {
    if (import.meta.env.DEV) {
    console.error('Socket connection error: ', error.message);
    }
  });

  socket.on(EVENTS.DISCONNECT, (reason) => {
    if (import.meta.env.DEV) {
      console.log('Socket disconnected: ', reason);
    }
  });

  return socket;
};

/**
 * Returns the current socket instance
 * @returns Current Socket instance or null if not connected
 */
export const getSocket = (): Socket | null => socket;

/**
 * Requests to join a specific conversation room on the server
 * Called by socketProvider to join all user conversations at once
 * @param conversationId - ID of conversation room to join
 */
export const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit(EVENTS.CONVERSATION_JOIN, conversationId);
  }
};

/**
 * Emits typing started event to the server
 * @param conversationId - ID of conversation where typing occurs
 */
export const startTyping = (conversationId: string) => {
  if (socket) {
    socket.emit(EVENTS.TYPING_START, conversationId);
  }
};

/**
 * Emits typing stopped event to the server
 * @param conversationId - ID of conversation where typing stopped
 */
export const stopTyping = (conversationId: string) => {
  if (socket) {
    socket.emit(EVENTS.TYPING_STOP, conversationId);
  }
};

/**
 * Disconnects the socket and resets the socket variable
 * Called when user logs out
 */
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
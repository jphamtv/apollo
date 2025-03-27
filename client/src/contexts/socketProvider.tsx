/**
 * Socket.io Provider for real-time communication
 *
 * Architecture decision:
 * This provider sits at the innermost layer of the context hierarchy because it
 * depends on all other contexts (auth, messaging) but nothing depends on it.
 *
 * Key optimizations:
 * 1. Automatically joins all conversation rooms at once to avoid manual room management
 * 2. Updates state directly through dispatch rather than separate API calls
 * 3. Implements a "conversation room" pattern to properly isolate events
 */
import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from './socketContext';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/apiClient';
import {
  EVENTS,
  initializeSocket,
  disconnectSocket,
  joinConversation,
} from '../utils/socketClient';
import { useMessaging } from '../hooks/useMessaging';
import { Message } from '../types/message';

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const {
    activeConversation,
    markConversationAsRead,
    dispatch,
    conversations,
  } = useMessaging();

  /**
   * Socket state management with three key pieces:
   * - socket: The actual socket.io instance
   * - isConnected: Connection status for UI indicators
   * - typingUsers: Map of conversation IDs to arrays of user IDs currently typing
   */
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  /**
   * Socket initialization on auth change
   *
   * Technical detail: We intentionally don't connect/disconnect on every component render
   * by properly tracking the socket reference and using disconnectSocket on cleanup
   */
  useEffect(() => {
    if (user) {
      const token = apiClient.getToken();
      if (!token) return;

      const newSocket = initializeSocket(token);
      setSocket(newSocket);

      newSocket.on(EVENTS.CONNECT, () => {
        setIsConnected(true);
      });

      newSocket.on(EVENTS.DISCONNECT, () => {
        setIsConnected(false);
      });

      return () => {
        disconnectSocket();
      };
    }
  }, [user]);

  /**
   * Automatically joins all conversation rooms when socket connects or conversations list changes
   * This eliminates the need for individual components to manually join rooms
   * and ensures all conversations receive real-time updates regardless of which one is active
   */
  useEffect(() => {
    if (socket && isConnected && conversations.length > 0) {
      // Join all conversation rooms of the logged in user, not just the active one
      conversations.forEach(conversation => {
        joinConversation(conversation.id);
      });
    }
  }, [socket, isConnected, conversations]);

  /**
   * Handles incoming real-time messages from all conversations
   * Updates the message state and marks messages as read if in active conversation
   */
  useEffect(() => {
    if (!socket) return;

    // Handle new messages
    socket.on(EVENTS.MESSAGE_RECEIVE, (message: Message) => {
      // Add new message to state
      dispatch({ type: 'RECEIVE_MESSAGE', message });

      // If this is the active conversation, mark it as read
      if (activeConversation?.id === message.conversationId) {
        markConversationAsRead(message.conversationId);
      }
    });

    return () => {
      socket.off(EVENTS.MESSAGE_RECEIVE);
    };
  }, [socket, dispatch, activeConversation, markConversationAsRead]);

  /**
   * Manages typing indicators from other users
   * Tracks which users are typing in which conversations
   */
  useEffect(() => {
    if (!socket) return;

    socket.on(EVENTS.TYPING_START, ({ userId, conversationId }) => {
      setTypingUsers(prev => {
        const conversationTypers = prev[conversationId] || [];

        // Only add if not already in the list
        if (!conversationTypers.includes(userId)) {
          return {
            ...prev,
            [conversationId]: [...conversationTypers, userId],
          };
        }
        return prev;
      });
    });

    socket.on(EVENTS.TYPING_STOP, ({ userId, conversationId }) => {
      setTypingUsers(prev => {
        const conversationTypers = prev[conversationId] || [];

        return {
          ...prev,
          [conversationId]: conversationTypers.filter(id => id !== userId),
        };
      });
    });

    return () => {
      socket.off(EVENTS.TYPING_START);
      socket.off(EVENTS.TYPING_STOP);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, typingUsers }}>
      {children}
    </SocketContext.Provider>
  );
};

import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { SocketContext } from './socketContext';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../utils/apiClient';
import { EVENTS, initializeSocket, disconnectSocket, joinConversation } from '../utils/socketClient';
import { useMessaging } from '../hooks/useMessaging';
import { Message } from '../types/message';

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const { activeConversation, markConversationAsRead, dispatch, conversations } = useMessaging();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, string[]>>({});

  // Initialize socket connection when user is authenticated
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

  // Join all conversation rooms when socket connects or conversations change
  useEffect(() => {
    if (socket && isConnected && conversations.length > 0) {
      // Join all conversation rooms, not just the active one
      conversations.forEach(conversation => {
        joinConversation(conversation.id);
      });
    }
  }, [socket, isConnected, conversations]);

  // Handle real-time message updates
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

  // Handle typing indicators
  useEffect(() => {
    if (!socket) return;

    socket.on(EVENTS.TYPING_START, ({ userId, conversationId }) => {
      setTypingUsers(prev => {
        const conversationTypers = prev[conversationId] || [];

        // Only add if not already in the list
        if (!conversationTypers.includes(userId)) {
          return {
            ...prev,
            [conversationId]: [...conversationTypers, userId]
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
          [conversationId]: conversationTypers.filter(id => id !== userId)
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
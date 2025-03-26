/**
 * Custom hook for socket.io functionality
 * Provides access to the socket connection and typing indicator functionality
 */
import { useContext, useCallback, useRef, useEffect } from 'react';
import { SocketContext } from '../contexts/socketContext';
import { startTyping, stopTyping } from '../utils/socketClient';

export const useSocket = () => {
  const context = useContext(SocketContext);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }

  const { socket, isConnected, typingUsers } = context;

  /**
   * Returns a list of users currently typing in a specific conversation
   * Used to show typing indicators in the UI
   */
  const getTypingUsers = useCallback(
    (conversationId: string) => {
      return typingUsers[conversationId] || [];
    },
    [typingUsers]
  );

  /**
   * Manages typing indicator state with debouncing
   * Automatically stops typing status after 2 seconds of inactivity
   */
  const handleTyping = useCallback(
    (conversationId: string, isTyping: boolean) => {
      // Clear any existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      if (isTyping) {
        startTyping(conversationId);

        // Set timeout to automatically stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
          stopTyping(conversationId);
          typingTimeoutRef.current = null;
        }, 2000);
      } else {
        stopTyping(conversationId);
      }
    },
    []
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return {
    socket,
    isConnected,
    getTypingUsers,
    handleTyping,
  };
};

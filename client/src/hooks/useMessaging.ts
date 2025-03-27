/**
 * Custom hook for accessing the messaging system functionality
 *
 * Architecture design pattern:
 * - Implements facade pattern over the messaging context
 * - Provides a simpler interface by destructuring complex context state
 * - Renames some functions for better semantic clarity (setActiveConversation -> selectConversation)
 *
 * This hook is the primary way components interact with the messaging system.
 * It encapsulates all functionality related to conversations and messages
 * while hiding the complexity of the context implementation.
 *
 * Usage considerations:
 * - Use for all messaging-related operations
 * - Exposes loading/error states for proper UI feedback
 * - Includes state dispatch for advanced use cases
 * - Must be used within a MessageProvider (enforced with error)
 */
import { useContext } from 'react';
import { MessageContext } from '../contexts/messageContext';

export function useMessaging() {
  // Retrieve the full context
  const context = useContext(MessageContext);

  // Ensure hook is used within provider
  if (!context) {
    throw new Error('useMessaging must be used within a MessageProvider');
  }

  // Destructure context for easier consumption
  const {
    state,
    dispatch,
    loadConversations,
    loadMessages,
    sendMessage,
    sendMessageWithImage,
    createConversation,
    setActiveConversation,
    clearActiveConversation,
    deleteConversation,
    markConversationAsRead,
    clearMessages,
    findConversationByParticipant,
  } = context;

  // Return a reorganized interface grouped by category
  return {
    // Data entities from state
    conversations: state.conversations,
    activeConversation: state.activeConversation,
    messages: state.messages,

    // Loading states for UI feedback
    isLoadingConversations: state.isLoadingConversations,
    isLoadingMessages: state.isLoadingMessages,
    isSendingMessage: state.isSendingMessage,
    isCreatingConversation: state.isCreatingConversation,

    // Error states for error handling
    conversationsError: state.conversationsError,
    messagesError: state.messagesError,

    // Raw dispatch for advanced state manipulation
    dispatch,

    // Conversation operations
    loadConversations,
    createConversation,
    selectConversation: setActiveConversation, // Renamed for clarity
    clearActiveConversation,
    deleteConversation,
    markConversationAsRead,
    findConversationByParticipant,

    // Message operations
    loadMessages,
    sendMessage,
    sendMessageWithImage,
    clearMessages,
  };
}

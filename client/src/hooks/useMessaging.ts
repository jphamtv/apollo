import { useContext } from 'react';
import { MessageContext } from '../contexts/messageContext';

export function useMessaging() {
  const context = useContext(MessageContext);
  
  if (!context) {
    throw new Error('useMessaging must be used within a MessageProvider');
  }

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
    findConversationByParticipant
  } = context;

  return {
    // State from context
    conversations: state.conversations,
    activeConversation: state.activeConversation,
    messages: state.messages,
    
    // Loading states
    isLoadingConversations: state.isLoadingConversations,
    isLoadingMessages: state.isLoadingMessages,
    isSendingMessage: state.isSendingMessage,
    isCreatingConversation: state.isCreatingConversation,
    
    // Error states
    conversationsError: state.conversationsError,
    messagesError: state.messagesError,

    // Include dispatch for advanced state manipulation
    dispatch,
    
    // Methods
    loadConversations,
    loadMessages,
    sendMessage,
    sendMessageWithImage,
    createConversation,
    selectConversation: setActiveConversation,
    clearActiveConversation,
    deleteConversation,
    markConversationAsRead,
    clearMessages,
    findConversationByParticipant
  };
}

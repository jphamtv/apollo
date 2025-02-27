import { useContext } from 'react';
import { MessageContext } from '../contexts/messageContext';

export function useMessaging() {
  const context = useContext(MessageContext);
  
  if (!context) {
    throw new Error('useMessaging must be used within a MessageProvider');
  }

  const { 
    state, 
    loadConversations,
    loadMessages,
    sendMessage,
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
    
    // Methods
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    selectConversation: setActiveConversation,
    clearActiveConversation,
    deleteConversation,
    markConversationAsRead,
    clearMessages,
    findConversationByParticipant
  };
}

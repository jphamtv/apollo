import { ReactNode, useReducer, useCallback, useEffect } from 'react';
import { 
  MessageContext, 
  messageReducer, 
  initialMessageState
} from './messageContext';
import { apiClient } from '../utils/apiClient';
import { Conversation } from '../types/conversation';
import { Message } from '../types/message';
import { useAuth } from '../hooks/useAuth';

interface MessageProviderProps {
  children: ReactNode;
}

export function MessageProvider({ children }: MessageProviderProps) {
  const [state, dispatch] = useReducer(messageReducer, initialMessageState);
  const { user } = useAuth(); 

  // Load all conversations
  const loadConversations = useCallback(async () => {
    dispatch({ type: 'LOAD_CONVERSATIONS_REQUEST' });

    try {
      const response = await apiClient.get<Conversation[]>('/conversations');
      
      // Transform the response to include lastMessage if needed
      const transformedConversations = response.map(conversation => ({
        ...conversation,
        lastMessage: conversation.messages && conversation.messages[0] ? {
          text: conversation.messages[0].text,
          createdAt: conversation.messages[0].createdAt
        } : undefined
      }));

      // Sort conversations by most recent activity (newest first)
      const sortedConversations = transformedConversations.sort((a, b) => {
        const aTime = a.lastMessage?.createdAt || a.createdAt;
        const bTime = b.lastMessage?.createdAt || b.createdAt;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      });
      
      dispatch({ 
        type: 'LOAD_CONVERSATIONS_SUCCESS', 
        conversations: sortedConversations 
      });
    } catch (err) {
      console.error('Load conversations error:', err);
      dispatch({ 
        type: 'LOAD_CONVERSATIONS_FAILURE', 
        error: 'Failed to load conversations' 
      });
    }
  }, []);
  
  // Load conversations when user logs in
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      // Reset state when user logs out
      dispatch({ type: 'RESET_STATE' });
    }
  }, [user, loadConversations]); 

  // Load messages for a specific conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    dispatch({ type: 'LOAD_MESSAGES_REQUEST' });

    try {
      const response = await apiClient.get<{ messages: Message[] }>(
        `/conversations/${conversationId}/messages`
      );
      
      if (!Array.isArray(response.messages)) {
        console.error('Expected messages array, got:', response.messages);
        dispatch({ 
          type: 'LOAD_MESSAGES_FAILURE', 
          error: 'Invalid response format' 
        });
        return;
      }
      
      dispatch({ 
        type: 'LOAD_MESSAGES_SUCCESS', 
        messages: response.messages 
      });
    } catch (err) {
      console.error('Load messages error:', err);
      dispatch({ 
        type: 'LOAD_MESSAGES_FAILURE', 
        error: 'Failed to load messages' 
      });
    }
  }, []);

  const sendMessage = useCallback(async (conversationId: string, text: string): Promise<Message> => {
    dispatch({ type: 'SEND_MESSAGE_REQUEST' });

    try {
      const response = await apiClient.post<{ message: Message }>(
        `/conversations/${conversationId}/messages`,
        { text }
      );

      if (!response.message) {
        throw new Error('No message in response');
      }
      
      dispatch({ 
        type: 'SEND_MESSAGE_SUCCESS', 
        message: response.message 
      });
      
      return response.message;
    } catch (err) {
      console.error('Send message error:', err);
      const errorMessage = 'Failed to send message';
      dispatch({ 
        type: 'SEND_MESSAGE_FAILURE', 
        error: errorMessage
      });
      throw new Error(errorMessage);
    }
  }, []);

  const findConversationByParticipant = useCallback((userId: string) => {
    return state.conversations.find(conv => 
      !conv.isGroup && 
      conv.participants.some(p => p.user.id === userId)
    );
  }, [state.conversations]);

  const createConversation = useCallback(async (userId: string): Promise<Conversation> => {
    // First, check locally for existing conversation
    const existingConversation = findConversationByParticipant(userId);
    if (existingConversation) {
      dispatch({
        type: 'SET_ACTIVE_CONVERSATION',
        conversation: existingConversation
      });
      return existingConversation;
    }

    dispatch({ type: 'CREATE_CONVERSATION_REQUEST' });

    try {
      const response = await apiClient.post<{ conversation: Conversation }, { participantIds: string[]; isGroup: boolean }>(
        '/conversations',
        {
          participantIds: [userId],
          isGroup: false
        }
      );

      if (!response.conversation) {
        throw new Error('No conversation in response');
      }

      dispatch({ 
        type: 'CREATE_CONVERSATION_SUCCESS', 
        conversation: response.conversation 
      });
      
      return response.conversation;
    } catch (err) {
      console.error('Create conversation error:', err);
      const errorMessage = 'Failed to create conversation';
      dispatch({ 
        type: 'CREATE_CONVERSATION_FAILURE', 
        error: errorMessage 
      });
      throw new Error(errorMessage);
    }
  }, [findConversationByParticipant, dispatch]);

  const setActiveConversation = useCallback((conversation: Conversation) => {
    dispatch({ 
      type: 'SET_ACTIVE_CONVERSATION', 
      conversation 
    });
  }, []);

  const clearActiveConversation = useCallback(() => {
    dispatch({ type: 'CLEAR_ACTIVE_CONVERSATION' });
  }, []);

  const clearMessages = useCallback(() => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const deleteConversation = useCallback(async (conversationId: string): Promise<void> => {
    dispatch({ type: 'DELETE_CONVERSATION_REQUEST' });

    try {
      await apiClient.delete(`/conversations/${conversationId}`);

      const conversationToDelete = state.conversations.find(
        (conv) => conv.id === conversationId
      );
      if (!conversationToDelete) {
        throw new Error('Conversation not found');
      }

      dispatch({
        type: 'DELETE_CONVERSATION_SUCCESS',
        conversation: conversationToDelete
      });

      if (state.activeConversation?.id === conversationId) {
        dispatch({ type: 'CLEAR_ACTIVE_CONVERSATION' });
      }
    } catch (err) {
      console.error('Delete conversation error: ', err);
      dispatch({
        type: 'DELETE_CONVERSATION_FAILURE',
        error: 'Failed to delete conversation'
      });
      throw new Error('Failed to delete conversation');
    }
  }, [state.conversations, state.activeConversation]);

  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      await apiClient.put(`/conversations/${conversationId}/read`, {});

      dispatch({
        type: 'MARK_CONVERSATION_READ_SUCCESS',
        conversationId
      });
    } catch (err) {
      console.error('Mark conversation as read error: ', err);
    }
  }, []);

  const contextValue = {
    state,
    dispatch,
    loadConversations,
    loadMessages,
    sendMessage,
    createConversation,
    deleteConversation,
    setActiveConversation,
    clearActiveConversation,
    markConversationAsRead,
    clearMessages,
    findConversationByParticipant
  };

  return (
    <MessageContext.Provider value={contextValue}>
      {children}
    </MessageContext.Provider>
  );
}

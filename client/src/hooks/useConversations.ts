import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { User } from '../types/user';
import { Message } from '../types/message';

interface Participant {
  id: string;
  userId: string;
  conversationId: string;
  joinedAt: string;
  leftAt: string | null;
  user: User;
}

interface Conversation {
  id: string;
  name: string | null;
  isGroup: boolean;
  participants: Participant[];
  lastMessage?: {
    text: string;
    createdAt: string;
  };
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface ConversationCreate {
  conversation: Conversation;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);

  const findConversationByParticipant = useCallback((userId: string) => {
    return conversations.find(conv => 
      !conv.isGroup && 
      conv.participants.some(p => p.user.id === userId)
    );
  }, [conversations]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Check for existing conversation
      const existingConversation = findConversationByParticipant(userId);
      if (existingConversation) {
        console.log('Found existing conversation:', existingConversation);
        setActiveConversation(existingConversation);
        return existingConversation;
      }

      console.log('Creating new conversation with:', userId);
      const response = await apiClient.post<ConversationCreate, { participantIds: string[]; isGroup: boolean }>('/conversations', {
        participantIds: [userId],
        isGroup: false
      });

      const newConversation = response.conversation;
      console.log('Created new conversation:', newConversation);
      
      setConversations(prev => [newConversation, ...prev]);
      setActiveConversation(newConversation);
      return newConversation;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Create conversation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [findConversationByParticipant]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Conversation[]>('/conversations');
      console.log('Raw response from /conversations:', response);
      
      // Transform the response to include lastMessage
      const transformedConversations = response.map(conversation => ({
        ...conversation,
        lastMessage: conversation.messages[0] ? {
          text: conversation.messages[0].text,
          createdAt: conversation.messages[0].createdAt
        } : undefined
      }));
      
      setConversations(transformedConversations);
      console.log('Set conversations to:', transformedConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Load conversations error:', err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback((conversation: Conversation) => {
    console.log('Selecting conversation:', conversation);
    setActiveConversation(conversation);
    console.log('Active conversation set to:', conversation);
  }, []);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ message: Message }>(
        `/conversations/${conversationId}/messages`,
        { text }
      );

      const newMessage = response.message;
      
      setConversations(prev => {
        return prev.map(conv => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              messages: [...(conv.messages || []), newMessage],
              lastMessage: {
                text: newMessage.text,
                createdAt: newMessage.createdAt
              }
            };
          }
          return conv;
        });
      });

      return newMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    conversations,
    activeConversation,
    isLoading,
    error,
    createConversation,
    loadConversations,
    selectConversation,
    sendMessage,
    findConversationByParticipant
  };
}
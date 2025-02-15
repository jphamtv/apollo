import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { User } from '../types/user';

interface Conversation {
  id: string;
  participants: User[];
  lastMessage?: {
    text: string;
    createdAt: string;
  };
}

interface ConversationResponse {
  conversation: Conversation;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createConversation = useCallback(async (userId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<ConversationResponse>('/conversations', {
        participantId: userId
      });

      const newConversation = response.conversation;
      
      setConversations(prev => {
        // Check if conversation already exists
        const exists = prev.some(conv => conv.id === newConversation.id);
        if (exists) return prev;
        return [newConversation, ...prev];
      });
      
      setActiveConversation(newConversation);
      return newConversation;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Create conversation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ conversations: Conversation[] }>('/conversations');
      setConversations(response.conversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Load conversations error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
  }, []);

  return {
    conversations,
    activeConversation,
    isLoading,
    error,
    createConversation,
    loadConversations,
    selectConversation
  };
}
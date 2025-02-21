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
      // First, check locally for existing conversation
      const existingLocalConversation = findConversationByParticipant(userId);
      if (existingLocalConversation) {
        setActiveConversation(existingLocalConversation);
        return existingLocalConversation;
      }

      // Always make a server request, which returns existing or 
      // creates a new conversation if needed
      const response = await apiClient.post<ConversationCreate, { participantIds: string[]; isGroup: boolean }>('/conversations', {
        participantIds: [userId],
        isGroup: false
      });

      const newConversation = response.conversation;

      // Check if this conversation already exists in our local state
      const conversationExists = conversations.some(c => c.id === newConversation.id);

      if (!conversationExists) {
        // Only add it if it's truly new
        setConversations(prev => [newConversation, ...prev]);        
      }
      
      setActiveConversation(newConversation);
      return newConversation;
    } catch (err) {
      setError('Failed to create conversation');
      console.error('Create conversation error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [findConversationByParticipant, conversations]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<Conversation[]>('/conversations');
      
      // Transform the response to include lastMessage
      const transformedConversations = response.map(conversation => ({
        ...conversation,
        lastMessage: conversation.messages[0] ? {
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
      
      setConversations(sortedConversations);
    } catch (err) {
      setError('Failed to load conversations');
      console.error('Load conversations error:', err);
      setConversations([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectConversation = useCallback((conversation: Conversation) => {
    setActiveConversation(conversation);
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
      // Find the conversation to update
      const updatedConversation = prev.find(c => c.id === conversationId);
      
      if (!updatedConversation) {
        return prev;
      }
      
      // Create updated conversation with new message
      const conversationWithNewMessage = {
        ...updatedConversation,
        messages: [...(updatedConversation.messages || []), newMessage],
        lastMessage: {
          text: newMessage.text,
          createdAt: newMessage.createdAt
        }
      };
      
      // Remove the conversation from the current array
      const filteredConversations = prev.filter(c => c.id !== conversationId);
      
      // Add the updated conversation to the beginning of the array
      return [conversationWithNewMessage, ...filteredConversations];
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
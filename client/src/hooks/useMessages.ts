import { useState, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { Message } from '../types/message';

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  const sendMessage = useCallback(async (conversationId: string, text: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.post<{ message: Message }>(
        `/conversations/${conversationId}/messages`,
        { text }
      );

      if (!response.message) {
        throw new Error('No message in response');
      }
      
      const newMessage = response.message;
      setMessages(prev => [...prev, newMessage]);
      return newMessage;
    } catch (err) {
      setError('Failed to send message');
      console.error('Send message error:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ messages: Message[] }>(
        `/conversations/${conversationId}/messages`
      );
      
      if (!Array.isArray(response.messages)) {
        console.error('Expected messages array, got:', response.messages);
        setMessages([]);
        return;
      }
      
      setMessages(response.messages);
    } catch (err) {
      setMessages([]);
      setError('Failed to load messages');
      console.error('Load messages error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    loadMessages,
    clearMessages
  };
}
// hooks/useUserSearch.ts
import { useState, useRef, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { User } from '../types/user';

export function useUserSearch() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  const searchUsers = useCallback(async (query: string) => {
    // Clear previous timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    
    // Set new timeout
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await apiClient.get<{ users: User[] }>(`/users/search?q=${encodeURIComponent(query)}`);
        setUsers(response.users);
      } catch (err) {
        setError('Failed to search users');
        console.error('User search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 500); // 500ms delay
  }, []);

  // Cleanup on unmount
  useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    searchUsers
  };
}
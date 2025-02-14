import { useState } from 'react';
import { apiClient } from '../utils/apiClient';
import { User } from '../types/user';

export function useUserSearch() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<{ users: User[] }>(`/users/search?q=${encodeURIComponent(query)}`);
      setUsers(response.users);
    } catch (err) {
      setError('Failed to search users');
      console.error('User search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    users,
    isLoading,
    error,
    searchUsers
  };
}
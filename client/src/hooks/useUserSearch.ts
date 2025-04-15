import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';
import { User } from '../types/user';

export function useUserSearch() {
  /**
   * State for user filtering and selection:
   * - allUsers: Complete array of all available users
   * - filteredUsers: Current filtered subset based on search input
   * - searchQuery: Current text input for filtering
   * - isLoading: Tracks API request status for UI feedback
   */
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Loads all users on initial mount
   * Only makes a single API call when the component mounts
   */
  const loadAllUsers = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const data = await apiClient.get<User[]>('/users');
      
      // Sort users alphabetically
      const sortedUsers = [...data].sort((a, b) => {
        const nameA = a.profile.displayName || a.username;
        const nameB = b.profile.displayName || b.username;
        return nameA.localeCompare(nameB);
      });
      
      setAllUsers(sortedUsers);
      setFilteredUsers(sortedUsers); // Initialize filtered users with all users
    } catch (err) {
      logger.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all users once on component mount
  useEffect(() => {
    loadAllUsers();
  }, [loadAllUsers]);

  /**
   * Updates search query and filters users in real-time
   * Filters are applied instantly on each keystroke
   * 
   * @param query Search terms to filter by username or display name
   */
  const updateSearchQuery = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      // If query is empty, show all users
      setFilteredUsers(allUsers);
    } else {
      // Filter users based on query
      const lowercaseQuery = query.toLowerCase();
      const filtered = allUsers.filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) || 
        (user.profile.displayName && user.profile.displayName.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredUsers(filtered);
    }
  }, [allUsers]);

  return {
    users: filteredUsers,
    isLoading,
    searchQuery,
    setSearchQuery: updateSearchQuery
  };
}

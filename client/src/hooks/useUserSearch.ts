/**
 * Custom hook for searching users with debounce functionality
 *
 * Key features:
 *
 * 1. Debounced API calls:
 *    - Implements a 500ms delay before searching to reduce API load
 *    - Cancels pending searches when input changes rapidly
 *    - Prevents unnecessary network requests during fast typing
 *
 * 2. State management:
 *    - Tracks loading state for UI feedback
 *    - Handles error conditions gracefully
 *    - Maintains list of matched users for selection
 *
 * 3. Performance optimizations:
 *    - Uses timeoutRef to avoid recreation of timeout references
 *    - Properly cleans up timeouts to prevent memory leaks
 *    - URL encodes search query to handle special characters
 *    - Empty query optimization to avoid unnecessary API calls
 */
// hooks/useUserSearch.ts
import { useState, useRef, useCallback } from 'react';
import { apiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';
import { User } from '../types/user';

export function useUserSearch() {
  /**
   * State for search functionality:
   * - users: Array of matched users from search
   * - isLoading: Tracks API request status for UI feedback
   * - error: Stores error message if search fails
   * - timeoutRef: Holds reference to the debounce timeout for cleanup
   */
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<number | undefined>(undefined);

  /**
   * Search users with debounce functionality
   *
   * Implementation details:
   * 1. Cancels any pending search timeouts
   * 2. Immediately returns empty results for empty queries
   * 3. Sets a 500ms delay to wait for typing to pause
   * 4. Handles API errors gracefully with user-friendly messages
   * 5. Ensures loading state is properly toggled for UI feedback
   *
   * @param query Search string to find matching users
   */
  const searchUsers = useCallback(async (query: string) => {
    // Clear previous search timeout to implement debouncing
    // This prevents API hammering during fast typing
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Skip API call for empty search to save resources
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setIsLoading(true);

    // Set new timeout
    timeoutRef.current = window.setTimeout(async () => {
      try {
        const response = await apiClient.get<{ users: User[] }>(
          `/users/search?q=${encodeURIComponent(query)}`
        );
        setUsers(response.users);
      } catch (err) {
        setError('Failed to search users');
        logger.error('User search error:', err);
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
    searchUsers,
  };
}

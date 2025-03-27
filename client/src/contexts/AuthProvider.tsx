/**
 * Authentication provider that manages user state and auth operations
 *
 * Architecture decisions:
 * 1. Positioned as the outermost provider in the context hierarchy
 * 2. Centralizes all auth-related operations to avoid code duplication
 * 3. Automatically handles token verification on app initialization
 *
 * Security considerations:
 * - JWT token is stored in localStorage for persistence (trade-off with XSS vulnerability)
 * - Token is verified on application start to prevent using expired tokens
 * - All API calls use the token from localStorage, providing automatic auth
 */
import { useState, useEffect } from 'react';
import { AuthContext, AuthContextType } from './authContext';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
} from '../types/user';
import { apiClient } from '../utils/apiClient';
import { logger } from '../utils/logger';
import type { UpdateProfileData } from './authContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Auto-authentication on application initialization
   *
   * This effect runs only once when the app starts and:
   * 1. Checks if a token exists in localStorage
   * 2. Verifies the token validity with the server
   * 3. Sets the authenticated user state if token is valid
   * 4. Removes invalid tokens to prevent repeated failed attempts
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<AuthResponse>('/auth/verify');
        setUser(response.user);
      } catch (err) {
        apiClient.removeToken();
        setUser(null);
        logger.error('Initialize Auth error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/login',
      credentials
    );
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await apiClient.post<AuthResponse>(
      '/auth/register',
      credentials
    );
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiClient.get('/auth/logout');
    } finally {
      apiClient.removeToken();
      setUser(null);
    }
  };

  /**
   * Updates user profile data
   *
   * Important implementation detail: This updates the local user state immediately
   * after API call success to prevent stale data if other components reference
   * this state before a re-fetch occurs
   */
  const updateProfile = async (data: UpdateProfileData) => {
    const response = await apiClient.put<AuthResponse>('/users/profile', data);
    setUser(response.user);
  };

  const uploadProfileImage = async (formData: FormData) => {
    const response = await apiClient.post<AuthResponse>(
      '/users/profile/image',
      formData
    );
    setUser(response.user);
  };

  const deleteProfileImage = async () => {
    const response = await apiClient.delete<AuthResponse>(
      '/users/profile/image'
    );
    setUser(response.user);
  };

  const deleteUserAccount = async () => {
    try {
      await apiClient.delete('/auth/delete');
    } finally {
      apiClient.removeToken();
      setUser(null);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    uploadProfileImage,
    deleteProfileImage,
    deleteUserAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

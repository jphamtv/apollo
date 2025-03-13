import { useState, useEffect } from "react";
import { AuthContext, AuthContextType } from "./authContext";
import { User, AuthResponse, LoginCredentials, RegisterCredentials } from "../types/user";
import { apiClient } from "../utils/apiClient";
import type { UpdateProfileData } from "./authContext";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await apiClient.get<AuthResponse>("/auth/verify");
        setUser(response.user);
      } catch (err) {
        apiClient.removeToken();
        setUser(null);
        console.error('Initialize Auth error: ', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    const response = await apiClient.post<AuthResponse>("/auth/login", credentials);
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const register = async (credentials: RegisterCredentials) => {
    const response = await apiClient.post<AuthResponse>("/auth/register", credentials);
    apiClient.setToken(response.token);
    setUser(response.user);
  };

  const logout = async () => {
    try {
      await apiClient.get("/auth/logout");
    } finally {
      apiClient.removeToken();
      setUser(null);
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const response = await apiClient.put<AuthResponse>("/users/profile", data);
    setUser(response.user);
  };

  const uploadProfileImage = async (formData: FormData) => {
    const response = await apiClient.post<AuthResponse>("/users/profile/image", formData);
    setUser(response.user);
  };

  const deleteProfileImage = async () => {
    const response = await apiClient.delete<AuthResponse>("/users/profile/image");
    setUser(response.user);
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
    deleteProfileImage
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
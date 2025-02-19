import { useState, useEffect, createContext, useContext } from "react";
import { User, LoginCredentials, AuthResponse } from "../types/user";
import { apiClient } from "../utils/apiClient";
import { useNavigation } from "../contexts/NavigationContext";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
}

interface UpdateProfileData {
  displayName: string;
  bio?: string;
  imageUrl?: string;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { reset } = useNavigation();

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

  const logout = async () => {
    try {
      await apiClient.get("/auth/logout");
    } finally {
      apiClient.removeToken();
      setUser(null);
      reset();
    }
  };

  const updateProfile = async (data: UpdateProfileData) => {
    const response = await apiClient.put<AuthResponse>("/users/profile", data);
    setUser(response.user);
  };

  return { user, isLoading, login, logout, updateProfile };
};
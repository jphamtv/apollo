import { createContext } from 'react';
import { User, LoginCredentials, RegisterCredentials } from '../types/user';

export interface UpdateProfileData {
  displayName: string;
  bio?: string;
  // imageUrl not included as it's handled by dedicated functions
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  uploadProfileImage: (formData: FormData) => Promise<void>;
  deleteProfileImage: () => Promise<void>;
  deleteUserAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

import { UserProfile } from './profile';

export interface User {
  id: string;
  username: string;
  email: string;
  profile?: UserProfile;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username: string;
}
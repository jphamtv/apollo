import { Request } from 'express';
import { UserBasicDetails } from './base';

export type AuthUser = UserBasicDetails;

// For the authenticated requests
export interface AuthRequest extends Request {
  user: AuthUser;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: AuthUser | null;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string | number;
}

export interface JwtPayload {
  id: string;
}

/**
 * Socket authentication middleware using JWT
 *
 * Security considerations:
 * 1. Uses the same JWT tokens as the REST API for unified authentication
 * 2. Validates token on every connection to prevent access with expired credentials
 * 3. Attaches decoded user data to socket.data for access in socket handlers
 *
 * Technical note: We're using socket.data instead of a custom namespace or property
 * as this is the recommended approach in Socket.io v4+ for middleware data attachment
 */
import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig';

/**
 * Authentication middleware for Socket.io connections
 * Verifies the JWT token passed in socket.handshake.auth
 *
 * When Socket.io applies this middleware to incoming connections,
 * it will attach the decoded user object to socket.data.user,
 * making it available in all socket event handlers
 */
export const verifySocketToken = (
  socket: Socket,
  next: (err?: Error) => void
) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, jwtConfig.secret);
    socket.data.user = decoded;
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(new Error('Authentication error: Token expired'));
    }
    next(new Error('Authentication error: Invalid token'));
  }
};

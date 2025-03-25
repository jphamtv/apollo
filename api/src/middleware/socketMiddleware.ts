import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwtConfig';

// Middleware to authenticate socket connections
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

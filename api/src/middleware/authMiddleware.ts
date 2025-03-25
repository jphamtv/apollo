import { Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest } from '../types';

// Basic JWT authentication
export const authenticateJWT = [
  passport.authenticate('jwt', { session: false }),
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  },
];

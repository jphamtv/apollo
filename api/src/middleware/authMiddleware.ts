// Authentication middleware using Passport JWT strategy
import { Response, NextFunction } from 'express';
import passport from 'passport';
import { AuthRequest } from '../types';

// Middleware to verify JWT tokens and ensure user is authenticated
// Uses Passport JWT strategy defined in passportConfig.ts
export const authenticateJWT = [
  passport.authenticate('jwt', { session: false }),
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    next();
  },
];

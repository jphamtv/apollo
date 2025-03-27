/**
 * Passport.js Authentication Configuration
 *
 * Security design:
 * 1. Uses two separate strategies for different authentication stages:
 *    - Local Strategy: For initial login with email/password
 *    - JWT Strategy: For subsequent API requests with token
 *
 * 2. Password security:
 *    - Passwords never returned to client (filtered out in Local Strategy)
 *    - bcrypt used for secure password comparison (prevents timing attacks)
 *
 * 3. JWT implementation:
 *    - Token extracted from Authorization header (Bearer scheme)
 *    - User ID stored in token, full user object fetched from database for each request
 *      to ensure up-to-date user information and prevent using revoked accounts
 */
import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { jwtConfig } from './jwtConfig';
import { findByEmail, findById } from '../models/authModel';
import { JwtPayload } from '../types';

/**
 * Initialize passport strategies
 *
 * Note: We don't use sessions (passport.serializeUser) because we use
 * stateless JWT authentication instead of session cookies
 */
// Local Strategy for username/password login
// This is only used for the initial /login endpoint
// All subsequent authentication uses JWT
function initialize() {
  const options = {
    usernameField: 'email',
    passwordField: 'password',
  };

  passport.use(
    new LocalStrategy(options, async (email, password, done) => {
      try {
        // Find user by email
        const user = await findByEmail(email);

        if (!user) {
          return done(null, false, { message: 'Incorrect email' });
        }

        // Check if password matches
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: 'Incorrect password' });
        }

        // Remove password from user object before adding to request
        // This is a critical security measure to prevent accidentally
        // sending the password hash to the client
        const { password: _, ...userWithoutPassword } = user;
        return done(null, userWithoutPassword);
      } catch (err) {
        return done(err);
      }
    })
  );

  // JWT Strategy - for protected routes
  const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: jwtConfig.secret,
  };

  passport.use(
    new JwtStrategy(jwtOptions, async (jwt_payload: JwtPayload, done) => {
      try {
        const user = await findById(jwt_payload.id);
        if (user) {
          return done(null, user);
        }
        return done(null, false);
      } catch {
        return done(null, false);
      }
    })
  );
}

export default initialize;

import bcrypt from 'bcryptjs';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { jwtConfig } from './jwtConfig';
import { findByEmail, findById } from '../models/authModel';
import { JwtPayload } from '../types';

function initialize() {
  // Local Strategy - for login
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

        // Remove password before passing to done
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

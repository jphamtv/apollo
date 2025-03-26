/**
 * Rate limiting middleware for various API endpoints
 * 
 * Security design principles:
 * 
 * 1. Progressive rate limiting strategy:
 *    - Critical endpoints (login, register) have stricter limits
 *    - General authenticated routes have higher thresholds
 * 
 * 2. Asymmetric limits for success/failure:
 *    - Failed login attempts count against limit (prevent brute force)
 *    - Successful logins don't count against limit (prevent lockout)
 * 
 * 3. Granular window periods:
 *    - Login: Short window (15 min) to quickly block suspicious activity
 *    - Register: Longer window (1 hour) to prevent account farming
 * 
 * The express-rate-limit package uses in-memory storage by default,
 * which means limits reset if the server restarts. In production,
 * this should be replaced with a Redis store for persistence across deployments.
 */
import rateLimit from 'express-rate-limit';

/**
 * Strict rate limiter for login endpoint to prevent brute force attacks
 * - 5 attempts per 15 minutes per IP address
 * - Only failed attempts count against the limit
 * - Successful logins reset the counter
 * 
 * Note: For a more secure implementation in production, this should track
 * both IP and username to prevent distributed brute force attacks
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per window
  message: {
    message: 'Too many login attempts, please try again in 15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipFailedRequests: false, // Count failed requests against the rate limit
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Moderate rate limiter for registration endpoint to prevent account creation abuse
 * - 3 registrations per hour per IP address
 * - Both successful and failed registration attempts count
 * - Used to prevent automated account creation and spam
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 registrations per hour
  message: {
    message:
      'Too many accounts created from this IP, please try again in an hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General rate limiter for all authenticated routes
 * - 100 requests per 15 minutes per IP address
 * - Applied to protected routes as a general safeguard
 * - Balanced to allow normal usage while preventing abuse
 * 
 * In production, this would be further segmented by endpoint
 * category with different limits for read vs. write operations
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

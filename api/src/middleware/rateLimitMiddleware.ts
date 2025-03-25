import rateLimit from 'express-rate-limit';

// Strict limiter for login attempts
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

// Moderate limiter for registration
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

// General limiter for authenticated routes
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: {
    message: 'Too many requests, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

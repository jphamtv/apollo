/**
 * Client-side logger with environment-aware log levels
 * 
 * Log levels (from highest to lowest):
 * - ERROR: Runtime errors that require attention
 * - WARN: Unexpected behavior that doesn't break the application
 * - INFO: General operational information
 * - DEBUG: Detailed information for troubleshooting
 * 
 * Environment configuration:
 * - Development: All logs are displayed
 * - Production: Only errors and warnings are displayed by default
 * 
 * Note: For client-side logging, we're more conservative about 
 * what gets logged in production to minimize console noise for users.
 */

// Determine if we should log at this level in the current environment
const shouldLog = (level: 'error' | 'warn' | 'info' | 'debug'): boolean => {
  // In production, only show error and warn levels
  if (!import.meta.env.DEV) {
    return level === 'error' || level === 'warn';
  }
  
  // In development, show all levels
  return true;
};

// Format log messages with timestamp for consistency
const getTimestamp = (): string => {
  return new Date().toISOString();
};

// The logger object with methods for each log level
export const logger = {
  error: (message: string, ...args: unknown[]) => {
    // Always log errors, but only with details in development
    if (import.meta.env.DEV) {
      console.error(`[${getTimestamp()}] [ERROR] ${message}`, ...args);
    } else {
      // In production, log minimal info without potentially sensitive details
      console.error(`[ERROR] ${message}`);
    }
  },
  
  warn: (message: string, ...args: unknown[]) => {
    if (shouldLog('warn')) {
      if (import.meta.env.DEV) {
        console.warn(`[${getTimestamp()}] [WARN] ${message}`, ...args);
      } else {
        console.warn(`[WARN] ${message}`);
      }
    }
  },
  
  info: (message: string, ...args: unknown[]) => {
    if (shouldLog('info')) {
      console.log(`[${getTimestamp()}] [INFO] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: unknown[]) => {
    if (shouldLog('debug')) {
      console.log(`[${getTimestamp()}] [DEBUG] ${message}`, ...args);
    }
  }
};

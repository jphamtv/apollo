/**
 * Application logger with environment-aware log levels
 *
 * Log levels priority (from highest to lowest):
 * - ERROR: Runtime errors that require immediate attention
 * - WARN: Unexpected behavior that doesn't break the application
 * - INFO: General operational information
 * - DEBUG: Detailed information for troubleshooting
 * - TRACE: Very detailed tracing information
 *
 * Environment configuration:
 * - Development: All logs are displayed (default)
 * - Production: Only errors and warnings are displayed by default
 * - Custom: Controlled via LOG_LEVEL environment variable
 */

// Define log levels and their priorities
enum LogLevel {
  ERROR = 0,
  WARN = 1,
  INFO = 2,
  DEBUG = 3,
  TRACE = 4,
}

// Get the current log level from environment variables
const getCurrentLogLevel = (): LogLevel => {
  const envLogLevel = process.env.LOG_LEVEL?.toLowerCase();

  // In production, default to showing only errors and warnings
  if (process.env.NODE_ENV === 'production') {
    if (!envLogLevel) return LogLevel.WARN;
  }

  // Map string log level to enum
  switch (envLogLevel) {
    case 'error':
      return LogLevel.ERROR;
    case 'warn':
      return LogLevel.WARN;
    case 'info':
      return LogLevel.INFO;
    case 'debug':
      return LogLevel.DEBUG;
    case 'trace':
      return LogLevel.TRACE;
    default:
      return LogLevel.INFO; // Default to INFO level for development
  }
};

// Should the log at the given level be displayed?
const shouldLog = (level: LogLevel): boolean => {
  return level <= getCurrentLogLevel();
};

// Add timestamp to log message
const timestamp = (): string => {
  return new Date().toISOString();
};

// Format the log message
const formatMessage = (level: string, message: string): string => {
  return `[${timestamp()}] [${level}] ${message}`;
};

// The logger object with methods for each log level
export const logger = {
  error: (message: string) => {
    console.error(formatMessage('ERROR', message));
  },

  warn: (message: string) => {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(formatMessage('WARN', message));
    }
  },

  info: (message: string) => {
    if (shouldLog(LogLevel.INFO)) {
      console.log(formatMessage('INFO', message));
    }
  },

  debug: (message: string) => {
    if (shouldLog(LogLevel.DEBUG)) {
      console.log(formatMessage('DEBUG', message));
    }
  },

  trace: (message: string) => {
    if (shouldLog(LogLevel.TRACE)) {
      console.log(formatMessage('TRACE', message));
    }
  },
};

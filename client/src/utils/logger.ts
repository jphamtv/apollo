// Simple logger that respects environment
export const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      console.log(`[INFO] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]) => {
    // Always log errors, but only with details in development
    if (import.meta.env.DEV) {
      console.error(`[ERROR] ${message}`, ...args);
    } else {
      // In production, log minimal info without potentially sensitive details
      console.error(`[ERROR] ${message}`);
    }
  },
};

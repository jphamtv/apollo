export const logger = {
  info: (message: string) => {
    if (
      process.env.NODE_ENV !== 'production' ||
      process.env.LOG_LEVEL === 'info'
    ) {
      console.log(`[INFO] ${message}`);
    }
  },
  error: (message: string) => {
    console.error(`[ERROR] ${message}`);
  },
};

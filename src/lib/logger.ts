/**
 * Logger utility for development and production
 * In production, only errors are logged to console
 * In development, all logs are shown
 */

const isDevelopment = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDevelopment) {
      console.log('[LOG]', ...args);
    }
  },
  
  error: (...args: unknown[]) => {
    console.error('[ERROR]', ...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDevelopment) {
      console.warn('[WARN]', ...args);
    }
  },
  
  debug: (...args: unknown[]) => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },
};


/**
 * Structured Logger
 *
 * Development Mode: All logging visible via console methods
 * Production Mode: All logging silenced (future: can add Sentry)
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  error?: Error
}

const isDevelopment = import.meta.env.DEV

function formatTimestamp(): string {
  return new Date().toISOString()
}

function formatLogEntry(entry: LogEntry): string {
  const { level, message, timestamp, data, error } = entry
  const dataStr = data ? ` ${JSON.stringify(data)}` : ''
  const errorStr = error ? ` ${error.message}` : ''
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${dataStr}${errorStr}`
}

export const logger = {
  /**
   * Log informational message
   */
  info: (message: string, data?: unknown) => {
    if (isDevelopment) {
      const entry: LogEntry = {
        level: 'info',
        message,
        timestamp: formatTimestamp(),
        data,
      }
      console.info(formatLogEntry(entry), data ?? '')
    }
  },

  /**
   * Log warning message
   */
  warn: (message: string, data?: unknown) => {
    if (isDevelopment) {
      const entry: LogEntry = {
        level: 'warn',
        message,
        timestamp: formatTimestamp(),
        data,
      }
      console.warn(formatLogEntry(entry), data ?? '')
    }
  },

  /**
   * Log error message
   */
  error: (message: string, error?: Error, data?: unknown) => {
    if (isDevelopment) {
      const entry: LogEntry = {
        level: 'error',
        message,
        timestamp: formatTimestamp(),
        error,
        data,
      }
      console.error(formatLogEntry(entry), error ?? '', data ?? '')
    }
  },

  /**
   * Log debug message (only in development)
   */
  debug: (message: string, data?: unknown) => {
    if (isDevelopment) {
      const entry: LogEntry = {
        level: 'debug',
        message,
        timestamp: formatTimestamp(),
        data,
      }
      console.debug(formatLogEntry(entry), data ?? '')
    }
  },
}

export default logger

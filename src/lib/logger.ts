type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: Error;
}

class Logger {
  private get isDevelopment(): boolean {
    return process.env.NODE_ENV === 'development';
  }

  private get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  }

  private formatTimestamp(): string {
    return new Date().toISOString();
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = this.formatTimestamp();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
    }

    return `${prefix} ${message}`;
  }

  private log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      context,
      error,
    };

    switch (level) {
      case 'debug':
        if (this.isDevelopment) {
          // eslint-disable-next-line no-console
          console.debug(this.formatMessage(level, message, context));
        }
        break;

      case 'info':
        // eslint-disable-next-line no-console
        console.info(this.formatMessage(level, message, context));
        break;

      case 'warn':
        // eslint-disable-next-line no-console
        console.warn(this.formatMessage(level, message, context));
        break;

      case 'error':
        // eslint-disable-next-line no-console
        console.error(this.formatMessage(level, message, context), error);
        if (this.isProduction && error) {
          this.sendToExternalService(entry);
        }
        break;
    }
  }

  private sendToExternalService(_entry: LogEntry): void {
    // TODO: Integrate with Sentry or other logging service
    // Example: Sentry.captureException(_entry.error, { extra: _entry.context });
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const normalizedError = error instanceof Error ? error : undefined;
    const errorContext = {
      ...context,
      errorMessage: error instanceof Error ? error.message : String(error),
    };

    this.log('error', message, errorContext, normalizedError);
  }

  // Convenience methods for common actions
  userAction(action: string, userId?: string, details?: LogContext): void {
    this.info(`User action: ${action}`, {
      userId,
      action,
      ...details,
    });
  }

  apiCall(method: string, endpoint: string, details?: LogContext): void {
    this.debug(`API ${method} ${endpoint}`, details);
  }

  apiSuccess(method: string, endpoint: string, details?: LogContext): void {
    this.info(`API ${method} ${endpoint} succeeded`, details);
  }

  apiError(method: string, endpoint: string, error: Error | unknown, details?: LogContext): void {
    this.error(`API ${method} ${endpoint} failed`, error, details);
  }

  performance(label: string, durationMs: number, context?: LogContext): void {
    this.info(`Performance: ${label}`, {
      durationMs,
      ...context,
    });
  }
}

export const logger = new Logger();

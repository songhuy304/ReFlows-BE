import { ConfigService } from '@nestjs/config';
import { Params, PinoLogger } from 'nestjs-pino';
import { IncomingMessage } from 'http';
import crypto from 'crypto';
import type { Request, Response } from 'express';
import { APP_ENVIRONMENT } from '@/common/configs/app.config';

/**
 * Creates Pino logger configuration for NestJS application
 *
 * This configuration provides:
 * - Pretty logging for local development (colorized, human-readable)
 * - Structured JSON logging for other environments (Grafana/ELK compatible)
 * - Automatic request/response logging with correlation tracking
 * - Security-sensitive data redaction
 * - Performance monitoring support
 *
 * @param configService - NestJS ConfigService instance
 * @returns Pino logger configuration params
 */
export const createLoggerConfig = (configService: ConfigService): Params => {
  const env = configService.get<APP_ENVIRONMENT>(
    'app.env',
    APP_ENVIRONMENT.LOCAL,
  );
  const isLocal = env === APP_ENVIRONMENT.LOCAL;
  const logLevel = configService.get<string>('app.logLevel', 'info');

  return {
    pinoHttp: {
      // Log level configuration
      level: logLevel,

      // Pretty printing for local development only
      transport: isLocal
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,

              // format đẹp dễ đọc
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',

              // custom màu level
              customColors: 'info:green,warn:yellow,error:red,debug:blue',

              // format log
              messageFormat: '{msg}',

              // bật single line cho gọn
              singleLine: false,
            },
          }
        : undefined,

      // Standard formatters for distributed logging
      formatters: {
        // Uppercase level for better visibility in log aggregators
        level: (label: string) => ({ level: label.toUpperCase() }),

        // Flatten bindings to avoid nested objects
        bindings: () => ({}),
      },

      // ISO 8601 timestamp for consistency across timezones
      timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,

      // Use standard 'message' key for compatibility
      messageKey: 'message',

      // Base context fields - included in every log
      base: {
        environment: env,
        service: configService.get<string>('app.name', 'nestjs-app'),
        version: configService.get<string>('app.versioning.version', '1'),
      },

      // Redact sensitive data from logs
      redact: {
        paths: [
          'req.headers.authorization',
          'req.headers.cookie',
          'req.body.password',
          'req.body.confirmPassword',
          'req.body.currentPassword',
          'req.body.newPassword',
          'req.body.token',
          'res.headers["set-cookie"]',
        ],
        remove: true,
      },

      // Add correlation ID and context to every log
      customProps: (req: IncomingMessage & { id?: string }) => ({
        correlationId: req.id,
      }),

      // Custom serializers - keep only essential fields
      serializers: {
        req: (req: Request) => ({
          method: req.method,
          url: req.url,
          userAgent: req.headers?.['user-agent']?.toString(),
        }),
        res: (res: Response) => ({
          statusCode: res.statusCode,
        }),
        err: (err: Error & { type?: string }) => ({
          type: err.type ?? err.name,
          message: err.message,
          stack: isLocal ? err.stack : undefined, // Stack traces only in local
        }),
      },

      // Auto-assign log level based on HTTP status
      customLogLevel: (_req: Request, res: Response, err?: Error) => {
        if (res.statusCode >= 500 || err) return 'error';
        if (res.statusCode >= 400) return 'warn';
        return 'info';
      },

      // Clean, informative log messages
      customSuccessMessage: (req: Request, res: Response) => {
        return `${req.method} ${req.url} ${res.statusCode}`;
      },

      customErrorMessage: (_req: Request, _res: Response, err: Error) => {
        return err.message;
      },

      // Attach request ID for distributed tracing
      genReqId: (req: IncomingMessage & { id?: string }) => {
        return (
          req.id ||
          req.headers['x-request-id']?.toString() ||
          crypto.randomUUID()
        );
      },
    },

    // Exclude health check and static endpoints from logging
    exclude: [
      '/health',
      '/health/live',
      '/health/ready',
      '/metrics',
      '/favicon.ico',
    ],
  };
};

/**
 * Logger utility class for structured application logging
 *
 * Usage:
 * ```typescript
 * import { PinoLogger } from 'nestjs-pino';
 *
 * class MyService {
 *   constructor(private readonly logger: PinoLogger) {
 *     this.logger.setContext(MyService.name);
 *   }
 *
 *   doSomething() {
 *     this.logger.info('Operation started');
 *     this.logger.error('Operation failed: %s', error.message);
 *
 *     // Structured logging
 *     this.logger.info({ userId: 123, action: 'login' }, 'User logged in');
 *   }
 * }
 * ```
 */
export class LoggerHelpers {
  /**
   * Log a business event with structured data
   *
   * @example
   * LoggerHelpers.logBusinessEvent(logger, 'user_signup', { userId: 123, plan: 'pro' });
   */
  static logBusinessEvent(
    logger: PinoLogger,
    event: string,
    metadata?: Record<string, unknown>,
  ): void {
    logger.info(
      {
        eventType: 'business',
        event,
        ...metadata,
      },
      `Business event: ${event}`,
    );
  }

  /**
   * Log performance metrics
   *
   * @example
   * const start = Date.now();
   * // ... operation ...
   * LoggerHelpers.logPerformance(logger, 'database_query', Date.now() - start);
   */
  static logPerformance(
    logger: PinoLogger,
    operation: string,
    durationMs: number,
    metadata?: Record<string, unknown>,
  ): void {
    logger.info(
      {
        eventType: 'performance',
        operation,
        durationMs,
        ...metadata,
      },
      `${operation} completed in ${durationMs}ms`,
    );
  }

  /**
   * Log with correlation ID for distributed tracing
   *
   * @example
   * LoggerHelpers.logWithCorrelation(logger, correlationId, 'Processing request', { step: 1 });
   */
  static logWithCorrelation(
    logger: PinoLogger,
    correlationId: string,
    message: string,
    metadata?: Record<string, unknown>,
  ): void {
    logger.info(
      {
        correlationId,
        ...metadata,
      },
      message,
    );
  }

  /**
   * Log security events (auth failures, suspicious activity, etc.)
   *
   * @example
   * LoggerHelpers.logSecurityEvent(logger, 'failed_login', { ip: req.ip, attempts: 3 });
   */
  static logSecurityEvent(
    logger: PinoLogger,
    event: string,
    metadata?: Record<string, unknown>,
  ): void {
    logger.warn(
      {
        eventType: 'security',
        event,
        ...metadata,
      },
      `Security event: ${event}`,
    );
  }
}

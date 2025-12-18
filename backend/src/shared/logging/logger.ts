import winston from 'winston';
import path from 'path';

export interface ILogger {
  info(message: string, meta?: any): void;
  error(message: string, meta?: any): void;
  warn(message: string, meta?: any): void;
  debug(message: string, meta?: any): void;
}

export class Logger implements ILogger {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env['LOG_LEVEL'] || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.prettyPrint()
      ),
      defaultMeta: {
        service: 'gestorpro-backend',
        version: process.env['npm_package_version'] || '1.0.0'
      },
      transports: [
        // Console transport
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          )
        }),
        
        // File transport for errors
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'error.log'),
          level: 'error',
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        
        // File transport for all logs
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'combined.log'),
          maxsize: 5242880, // 5MB
          maxFiles: 5
        })
      ],
      exceptionHandlers: [
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'exceptions.log')
        })
      ],
      rejectionHandlers: [
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'rejections.log')
        })
      ]
    });

    // Create logs directory if it doesn't exist
    const fs = require('fs');
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  info(message: string, meta?: any): void {
    this.logger.info(message, meta);
  }

  error(message: string, meta?: any): void {
    this.logger.error(message, meta);
  }

  warn(message: string, meta?: any): void {
    this.logger.warn(message, meta);
  }

  debug(message: string, meta?: any): void {
    this.logger.debug(message, meta);
  }

  // Métodos específicos para diferentes contextos
  logRequest(req: any, res: any, responseTime: number): void {
    this.info('HTTP Request', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      requestId: req.headers['x-request-id']
    });
  }

  logError(error: Error, context?: any): void {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }

  logDatabaseQuery(query: string, params?: any, duration?: number): void {
    this.debug('Database Query', {
      query,
      params,
      duration: duration ? `${duration}ms` : undefined
    });
  }

  logBusinessEvent(event: string, data?: any): void {
    this.info('Business Event', {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }

  logSecurityEvent(event: string, data?: any): void {
    this.warn('Security Event', {
      event,
      data,
      timestamp: new Date().toISOString()
    });
  }
}

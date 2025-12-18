import { Request, Response, NextFunction } from 'express';
import { injectable } from 'inversify';
import { ILogger } from '@/shared/logging/logger';

export interface ErrorResponse {
  error: string;
  message: string;
  details?: any;
  requestId?: string;
  timestamp: string;
}

@injectable()
export class ErrorHandler {
  constructor(private readonly logger: ILogger) {}

  static handle(error: Error, req: Request, res: Response, _next: NextFunction): void {
    const logger = new ErrorHandler(new (require('@/shared/logging/logger').Logger)());
    logger.handleError(error, req, res);
  }

  handleError(error: Error, req: Request, res: Response): void {
    const requestId = req.headers['x-request-id'] as string;
    
    // Log do erro
    this.logger.error('Unhandled error', {
      error: error.message,
      stack: error.stack,
      requestId,
      url: req.url,
      method: req.method,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Determinar status code baseado no tipo de erro
    let statusCode = 500;
    let message = 'Internal server error';

    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Validation failed';
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Unauthorized';
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
      message = 'Forbidden';
    } else if (error.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Not found';
    } else if (error.name === 'ConflictError') {
      statusCode = 409;
      message = 'Conflict';
    } else if (error.name === 'PrismaClientKnownRequestError') {
      statusCode = 400;
      message = 'Database error';
    } else if (error.name === 'PrismaClientUnknownRequestError') {
      statusCode = 500;
      message = 'Database error';
    }

    // Resposta de erro
    const errorResponse: ErrorResponse = {
      error: error.name || 'Error',
      message: process.env['NODE_ENV'] === 'production' ? message : error.message,
      requestId,
      timestamp: new Date().toISOString()
    };

    // Adicionar detalhes em desenvolvimento
    if (process.env['NODE_ENV'] !== 'production') {
      errorResponse.details = {
        stack: error.stack,
        url: req.url,
        method: req.method
      };
    }

    res.status(statusCode).json(errorResponse);
  }

  // Middleware para capturar erros assíncronos
  static asyncHandler(fn: Function) {
    return (req: Request, _res: Response, next: NextFunction) => {
      Promise.resolve(fn(req, _res, next)).catch(next);
    };
  }

  // Middleware para validação de entrada
  static validateRequest(schema: any) {
    return (req: Request, _res: Response, next: NextFunction) => {
      try {
        const { error } = schema.validate(req.body);
        if (error) {
          const validationError = new Error('Validation failed');
          validationError.name = 'ValidationError';
          (validationError as any).details = error.details;
          throw validationError;
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  // Middleware para tratamento de erros de rota não encontrada
  static notFoundHandler(req: Request, _res: Response, _next: NextFunction): void {
    const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
    error.name = 'NotFoundError';
    _next(error);
  }
}

import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class DebugInterceptor implements NestInterceptor {
  private readonly logger = new Logger('DebugInterceptor');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (process.env.NODE_ENV !== 'development') {
      return next.handle();
    }

    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const startTime = Date.now();

    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || 'Unknown';

    // Log incoming request
    this.logger.debug(`📥 Incoming ${method} ${url}`);

    if (Object.keys(query).length > 0) {
      this.logger.debug(`🔍 Query params:`, query);
    }

    if (Object.keys(params).length > 0) {
      this.logger.debug(`📋 Route params:`, params);
    }

    if (body && Object.keys(body).length > 0) {
      // Don't log sensitive data
      const sanitizedBody = this.sanitizeBody(body);
      this.logger.debug(`📝 Request body:`, sanitizedBody);
    }

    if (process.env.DEBUG_HEADERS === 'true') {
      this.logger.debug(`📋 Headers:`, {
        'content-type': headers['content-type'],
        'user-agent': userAgent,
        'authorization': headers.authorization ? 'Bearer [REDACTED]' : undefined,
      });
    }

    return next.handle().pipe(
      tap((data) => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        this.logger.debug(`📤 Response ${method} ${url} - ${statusCode} in ${duration}ms`);

        if (process.env.DEBUG_RESPONSE === 'true' && data) {
          const sanitizedData = this.sanitizeResponse(data);
          this.logger.debug(`📊 Response data:`, sanitizedData);
        }

        // Log performance warning for slow requests
        if (duration > 1000) {
          this.logger.warn(`🐌 Slow request detected: ${method} ${url} took ${duration}ms`);
        }
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        this.logger.error(`❌ Request failed ${method} ${url} after ${duration}ms:`, {
          message: error.message,
          stack: process.env.DEBUG_STACK === 'true' ? error.stack : undefined,
        });
        throw error;
      }),
    );
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  private sanitizeResponse(data: any): any {
    if (!data || typeof data !== 'object') return data;

    // Limit response logging to avoid huge logs
    if (Array.isArray(data)) {
      return {
        type: 'array',
        length: data.length,
        sample: data.slice(0, 2), // Show first 2 items
      };
    }

    if (data.data && Array.isArray(data.data)) {
      return {
        ...data,
        data: {
          type: 'array',
          length: data.data.length,
          sample: data.data.slice(0, 2),
        },
      };
    }

    return data;
  }
}

import { Logger } from '@nestjs/common';

export class DebugUtils {
  private static logger = new Logger('DebugUtils');

  /**
   * Enhanced logging for debugging API calls
   */
  static logApiCall(method: string, url: string, body?: any, query?: any) {
    this.logger.debug(`🌐 API ${method.toUpperCase()} ${url}`);

    if (query && Object.keys(query).length > 0) {
      this.logger.debug(`📋 Query:`, JSON.stringify(query, null, 2));
    }

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`📝 Body:`, JSON.stringify(body, null, 2));
    }
  }

  /**
   * Log database operations
   */
  static logDbOperation(operation: string, collection: string, filter?: any, data?: any) {
    this.logger.debug(`🗄️  DB ${operation.toUpperCase()} on ${collection}`);

    if (filter) {
      this.logger.debug(`🔍 Filter:`, JSON.stringify(filter, null, 2));
    }

    if (data) {
      this.logger.debug(`📊 Data:`, JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log validation errors
   */
  static logValidationError(errors: any[], context: string = 'Validation') {
    this.logger.error(`❌ ${context} failed:`, errors);
  }

  /**
   * Log performance metrics
   */
  static logPerformance(operation: string, startTime: number, metadata?: any) {
    const duration = Date.now() - startTime;
    this.logger.debug(`⏱️  ${operation} took ${duration}ms`);

    if (metadata) {
      this.logger.debug(`📈 Metadata:`, JSON.stringify(metadata, null, 2));
    }
  }

  /**
   * Log memory usage
   */
  static logMemoryUsage(context: string = 'Memory Check') {
    const memUsage = process.memoryUsage();
    this.logger.debug(`🧠 ${context}:`, {
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024)}MB`,
    });
  }

  /**
   * Create a debug decorator for methods
   */
  static createDebugDecorator(context: string = 'Method') {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        DebugUtils.logger.debug(`🚀 ${context}.${propertyKey} called with:`, args);

        try {
          const result = await originalMethod.apply(this, args);
          DebugUtils.logPerformance(`${context}.${propertyKey}`, startTime);
          DebugUtils.logger.debug(`✅ ${context}.${propertyKey} result:`, result);
          return result;
        } catch (error) {
          DebugUtils.logger.error(`❌ ${context}.${propertyKey} error:`, error);
          throw error;
        }
      };

      return descriptor;
    };
  }

  /**
   * Create a profiling wrapper
   */
  static profile<T>(label: string, fn: () => Promise<T> | T): Promise<T> | T {
    const startTime = Date.now();
    this.logger.debug(`🔄 Starting ${label}`);

    try {
      const result = fn();

      if (result instanceof Promise) {
        return result
          .then((res) => {
            this.logPerformance(label, startTime);
            return res;
          })
          .catch((error) => {
            this.logger.error(`❌ ${label} failed:`, error);
            throw error;
          });
      } else {
        this.logPerformance(label, startTime);
        return result;
      }
    } catch (error) {
      this.logger.error(`❌ ${label} failed:`, error);
      throw error;
    }
  }
}

// Debug decorator for classes
export const Debug = (context?: string) => {
  return DebugUtils.createDebugDecorator(context);
};

// Profile decorator
export const Profile = (label?: string) => {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    const profileLabel = label || `${target.constructor.name}.${propertyKey}`;

    descriptor.value = function (...args: any[]) {
      return DebugUtils.profile(profileLabel, () => originalMethod.apply(this, args));
    };

    return descriptor;
  };
};

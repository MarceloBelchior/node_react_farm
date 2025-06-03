import { Logger } from '@nestjs/common';
import mongoose from 'mongoose';

export class MongoDebugUtils {
  private static logger = new Logger('MongoDebugUtils');

  /**
   * Enable mongoose debugging in development mode
   */
  static enableMongooseDebug() {
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);

      // Custom debug function for better formatting
      mongoose.set('debug', (collectionName: string, method: string, query: any, doc?: any) => {
        this.logger.debug(`🗄️  MongoDB Query:`, {
          collection: collectionName,
          method: method,
          query: JSON.stringify(query, null, 2),
          ...(doc && { document: JSON.stringify(doc, null, 2) })
        });
      });

      this.logger.log('✅ MongoDB debugging enabled');
    }
  }

  /**
   * Log MongoDB connection events
   */
  static setupConnectionLogging() {
    const connection = mongoose.connection;

    connection.on('connecting', () => {
      this.logger.log('🔄 Connecting to MongoDB...');
    });

    connection.on('connected', () => {
      this.logger.log('✅ Connected to MongoDB');
    });

    connection.on('open', () => {
      this.logger.log('🌐 MongoDB connection opened');
    });

    connection.on('disconnecting', () => {
      this.logger.warn('⚠️  Disconnecting from MongoDB...');
    });

    connection.on('disconnected', () => {
      this.logger.warn('❌ Disconnected from MongoDB');
    });

    connection.on('close', () => {
      this.logger.warn('🔒 MongoDB connection closed');
    });

    connection.on('error', (error) => {
      this.logger.error('❌ MongoDB connection error:', error);
    });

    connection.on('reconnected', () => {
      this.logger.log('🔄 Reconnected to MongoDB');
    });
  }

  /**
   * Log query performance
   */
  static logQueryPerformance(operation: string, query: any, startTime: number, resultCount?: number) {
    const duration = Date.now() - startTime;

    this.logger.debug(`⏱️  Query Performance:`, {
      operation,
      duration: `${duration}ms`,
      query: JSON.stringify(query, null, 2),
      ...(resultCount !== undefined && { resultCount })
    });

    // Warn about slow queries
    if (duration > 500) {
      this.logger.warn(`🐌 Slow query detected (${duration}ms):`, {
        operation,
        query: JSON.stringify(query, null, 2)
      });
    }
  }

  /**
   * Create a debug decorator for service methods that interact with MongoDB
   */
  static createServiceDebugDecorator(serviceName: string) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
      const originalMethod = descriptor.value;

      descriptor.value = async function (...args: any[]) {
        const startTime = Date.now();
        MongoDebugUtils.logger.debug(`🚀 ${serviceName}.${propertyKey} called with:`, args);

        try {
          const result = await originalMethod.apply(this, args);
          const duration = Date.now() - startTime;

          MongoDebugUtils.logger.debug(`✅ ${serviceName}.${propertyKey} completed in ${duration}ms`);

          if (result && typeof result === 'object') {
            if (Array.isArray(result)) {
              MongoDebugUtils.logger.debug(`📊 Result: Array with ${result.length} items`);
            } else if (result._id) {
              MongoDebugUtils.logger.debug(`📊 Result: Document with ID ${result._id}`);
            }
          }

          return result;
        } catch (error) {
          MongoDebugUtils.logger.error(`❌ ${serviceName}.${propertyKey} error:`, error);
          throw error;
        }
      };

      return descriptor;
    };
  }
}

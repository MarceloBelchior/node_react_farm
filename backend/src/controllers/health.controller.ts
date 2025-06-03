import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { logger } from '../config/logger';

/**
 * @desc    Health check endpoint
 * @route   GET /api/health
 * @access  Public
 */
export const getHealthCheck = async (req: Request, res: Response) => {
  try {
    const dbStatus = getConnectionStatus(mongoose.connection.readyState);
    const healthCheck = {
      status: 'ok',
      info: {
        database: { status: dbStatus === 'connected' ? 'up' : 'down' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' }
      },
      error: {},
      details: {
        database: { status: dbStatus === 'connected' ? 'up' : 'down' },
        memory_heap: { status: 'up' },
        memory_rss: { status: 'up' },
        storage: { status: 'up' }
      }
    };

    logger.info('Health check requested', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      status: healthCheck.status
    }); res.status(200).json(healthCheck);
  } catch (error) {
    logger.error('Health check failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    res.status(503).json({
      status: 'error',
      info: {
        database: { status: 'down' },
        memory_heap: { status: 'unknown' },
        memory_rss: { status: 'unknown' },
        storage: { status: 'unknown' }
      },
      error: {
        message: error instanceof Error ? error.message : 'Health check failed'
      },
      details: {
        database: { status: 'down' },
        memory_heap: { status: 'unknown' },
        memory_rss: { status: 'unknown' },
        storage: { status: 'unknown' }
      }
    });
  }
};

/**
 * Convert mongoose connection readyState to human readable status
 */
function getConnectionStatus(readyState: number): string {
  switch (readyState) {
    case 0:
      return 'disconnected';
    case 1:
      return 'connected';
    case 2:
      return 'connecting';
    case 3:
      return 'disconnecting';
    default:
      return 'unknown';
  }
}

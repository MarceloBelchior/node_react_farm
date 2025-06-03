import { Router } from 'express';
import { getHealthCheck } from '../controllers/health.controller';

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: System health check
 *     description: Checks the health status of the API server and database connection. Useful for monitoring and load balancer health checks.
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "API is healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2025-06-03T17:30:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 12345.67
 *                 database:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     name:
 *                       type: string
 *                       example: "agricultura"
 *       503:
 *         description: System is unhealthy (database connection issues)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Database connection failed"
 *                 error:
 *                   type: string
 *                   example: "Connection timeout"
 */
router.get('/', getHealthCheck);

export default router;

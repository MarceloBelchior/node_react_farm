import { Router } from 'express';
import { 
  getDashboardStats, 
  getFarmsByState, 
  getCropDistribution, 
  getLandUseDistribution,
  getFarmSizeDistribution,
  getTopProducers
} from '../controllers/dashboard.controller';

const router = Router();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get comprehensive dashboard statistics
 *     description: Retrieves comprehensive statistics for the dashboard including total farms, producers, hectares, crop distribution, and land use analytics.
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DashboardStats'
 *       500:
 *         description: Internal server error
 */
router.get('/stats', getDashboardStats);

/**
 * @swagger
 * /api/dashboard/farms-by-state:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get farms distribution by state
 *     description: Retrieves the total number of farms grouped by Brazilian states.
 *     responses:
 *       200:
 *         description: Farms by state data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                       example:
 *                         SP: 45
 *                         MG: 30
 *                         MT: 25
 *                         GO: 20
 *       500:
 *         description: Internal server error
 */
router.get('/farms-by-state', getFarmsByState);

/**
 * @swagger
 * /api/dashboard/crop-distribution:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get crop distribution analytics
 *     description: Retrieves detailed crop distribution data showing which crops are most commonly grown.
 *     responses:
 *       200:
 *         description: Crop distribution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       additionalProperties:
 *                         type: number
 *                       example:
 *                         Soja: 85
 *                         Milho: 65
 *                         Algodão: 25
 *                         Café: 15
 *                         "Cana de Açúcar": 10
 *       500:
 *         description: Internal server error
 */
router.get('/crop-distribution', getCropDistribution);

/**
 * @swagger
 * /api/dashboard/land-use:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get land use distribution
 *     description: Retrieves land use distribution data showing the breakdown between agricultural and vegetation areas.
 *     responses:
 *       200:
 *         description: Land use distribution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         agricultural:
 *                           type: number
 *                           description: Total agricultural area in hectares
 *                           example: 95000.0
 *                         vegetation:
 *                           type: number
 *                           description: Total vegetation area in hectares
 *                           example: 30000.5
 *       500:
 *         description: Internal server error
 */
router.get('/land-use', getLandUseDistribution);

/**
 * @swagger
 * /api/dashboard/farm-size-distribution:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get farm size distribution
 *     description: Retrieves distribution data of farms categorized by size ranges (small, medium, large).
 *     responses:
 *       200:
 *         description: Farm size distribution data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         small:
 *                           type: number
 *                           description: Number of small farms (< 100 hectares)
 *                           example: 45
 *                         medium:
 *                           type: number
 *                           description: Number of medium farms (100-500 hectares)
 *                           example: 35
 *                         large:
 *                           type: number
 *                           description: Number of large farms (> 500 hectares)
 *                           example: 20
 *       500:
 *         description: Internal server error
 */
router.get('/farm-size-distribution', getFarmSizeDistribution);

/**
 * @swagger
 * /api/dashboard/top-producers:
 *   get:
 *     tags: [Dashboard]
 *     summary: Get top producers by total area
 *     description: Retrieves a list of top producers ranked by their total farm area.
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *         description: Number of top producers to return
 *     responses:
 *       200:
 *         description: Top producers data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           producer:
 *                             $ref: '#/components/schemas/Producer'
 *                           totalArea:
 *                             type: number
 *                             example: 2500.75
 *                           farmCount:
 *                             type: number
 *                             example: 3
 *       500:
 *         description: Internal server error
 */
router.get('/top-producers', getTopProducers);

export default router;

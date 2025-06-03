import { Router } from 'express';
import { 
  createFarm, 
  getFarms, 
  getFarmById, 
  updateFarm, 
  deleteFarm,
  addCropToFarm,
  removeCropFromFarm,
  updateCropInFarm
} from '../controllers/farm.controller';
import { validateFarm, validateCrop } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/farms:
 *   post:
 *     tags: [Farms]
 *     summary: Create a new farm
 *     description: Creates a new farm and associates it with an existing producer. Validates that arable area + vegetation area equals total area.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/CreateFarmRequest'
 *               - type: object
 *                 required: [producerId]
 *                 properties:
 *                   producerId:
 *                     type: string
 *                     description: ID of the producer who owns this farm
 *                     example: "683f2c15ef80d24658e93496"
 *           example:
 *             name: "Fazenda Nova Esperança"
 *             city: "Ribeirão Preto"
 *             state: "SP"
 *             totalArea: 1500.0
 *             arableArea: 1200.0
 *             vegetationArea: 300.0
 *             crops: ["Soja", "Milho"]
 *             producerId: "683f2c15ef80d24658e93496"
 *     responses:
 *       201:
 *         description: Farm created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Farm'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Producer not found
 *       500:
 *         description: Internal server error
 */
router.post('/', validateFarm, createFarm);

/**
 * @swagger
 * /api/farms:
 *   get:
 *     tags: [Farms]
 *     summary: Get all farms
 *     description: Retrieves a paginated list of farms with optional filtering by producer, location, and area.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - in: query
 *         name: producerId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter by producer ID
 *       - in: query
 *         name: state
 *         schema:
 *           type: string
 *           pattern: '^[A-Z]{2}$'
 *         description: Filter by state (2-letter code)
 *         example: "SP"
 *       - in: query
 *         name: city
 *         schema:
 *           type: string
 *         description: Filter by city name
 *         example: "Ribeirão Preto"
 *       - in: query
 *         name: minArea
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum total area in hectares
 *         example: 100
 *       - in: query
 *         name: maxArea
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum total area in hectares
 *         example: 1000
 *     responses:
 *       200:
 *         description: List of farms retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PaginationResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Farm'
 *       500:
 *         description: Internal server error
 */
router.get('/', getFarms);

/**
 * @swagger
 * /api/farms/{id}:
 *   get:
 *     tags: [Farms]
 *     summary: Get a farm by ID
 *     description: Retrieves detailed information about a specific farm including producer information.
 *     parameters:
 *       - $ref: '#/components/parameters/FarmIdParam'
 *     responses:
 *       200:
 *         description: Farm found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Farm'
 *       404:
 *         description: Farm not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getFarmById);

/**
 * @swagger
 * /api/farms/{id}:
 *   put:
 *     tags: [Farms]
 *     summary: Update a farm
 *     description: Updates an existing farm's information. Validates that arable area + vegetation area equals total area.
 *     parameters:
 *       - $ref: '#/components/parameters/FarmIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateFarmRequest'
 *     responses:
 *       200:
 *         description: Farm updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Farm'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Farm not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateFarm, updateFarm);

/**
 * @swagger
 * /api/farms/{id}:
 *   delete:
 *     tags: [Farms]
 *     summary: Delete a farm
 *     description: Permanently deletes a farm. This action cannot be undone.
 *     parameters:
 *       - $ref: '#/components/parameters/FarmIdParam'
 *     responses:
 *       200:
 *         description: Farm deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Farm not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteFarm);

/**
 * @swagger
 * /api/farms/{id}/crops:
 *   post:
 *     tags: [Farms]
 *     summary: Add a crop to a farm
 *     description: Adds a new crop type to an existing farm's crop list.
 *     parameters:
 *       - $ref: '#/components/parameters/FarmIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [crop]
 *             properties:
 *               crop:
 *                 type: string
 *                 enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar']
 *                 description: Type of crop to add
 *                 example: "Café"
 *     responses:
 *       200:
 *         description: Crop added successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Farm'
 *       400:
 *         description: Validation error or crop already exists
 *       404:
 *         description: Farm not found
 *       500:
 *         description: Internal server error
 */
router.post('/:id/crops', validateCrop, addCropToFarm);

/**
 * @swagger
 * /api/farms/{id}/crops/{cropId}:
 *   put:
 *     tags: [Farms]
 *     summary: Update a crop in a farm
 *     description: Updates an existing crop type in a farm's crop list.
 *     parameters:
 *       - $ref: '#/components/parameters/FarmIdParam'
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *         description: Current crop name to be updated
 *         example: "Milho"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [crop]
 *             properties:
 *               crop:
 *                 type: string
 *                 enum: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar']
 *                 description: New crop type
 *                 example: "Algodão"
 *     responses:
 *       200:
 *         description: Crop updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Farm'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Farm or crop not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id/crops/:cropId', validateCrop, updateCropInFarm);

/**
 * @swagger
 * /api/farms/{id}/crops/{cropId}:
 *   delete:
 *     tags: [Farms]
 *     summary: Remove a crop from a farm
 *     description: Removes a crop type from a farm's crop list.
 *     parameters:
 *       - $ref: '#/components/parameters/FarmIdParam'
 *       - in: path
 *         name: cropId
 *         required: true
 *         schema:
 *           type: string
 *         description: Crop name to be removed
 *         example: "Milho"
 *     responses:
 *       200:
 *         description: Crop removed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Farm'
 *       404:
 *         description: Farm or crop not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/crops/:cropId', removeCropFromFarm);

export default router;

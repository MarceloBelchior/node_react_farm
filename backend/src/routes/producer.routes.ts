import { Router } from 'express';
import { 
  createProducer, 
  getProducers, 
  getProducerById, 
  updateProducer, 
  deleteProducer 
} from '../controllers/producer.controller';
import { validateProducer } from '../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/producers:
 *   post:
 *     tags: [Producers]
 *     summary: Create a new rural producer
 *     description: Creates a new rural producer with optional farms. CPF/CNPJ validation is performed.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProducerRequest'
 *           examples:
 *             basic:
 *               summary: Basic producer
 *               value:
 *                 name: "João Silva"
 *                 cpfCnpj: "12345678909"
 *                 email: "joao.silva@email.com"
 *                 phone: "(11) 99999-9999"
 *                 address: "Rua das Flores, 123, Centro, São Paulo, SP"
 *             with_farms:
 *               summary: Producer with farms
 *               value:
 *                 name: "Maria Santos"
 *                 cpfCnpj: "98765432100"
 *                 email: "maria.santos@email.com"
 *                 phone: "(11) 88888-8888"
 *                 address: "Fazenda Boa Vista, Rural, Ribeirão Preto, SP"
 *                 farms:
 *                   - name: "Fazenda Santa Clara"
 *                     city: "Ribeirão Preto"
 *                     state: "SP"
 *                     totalArea: 1000.5
 *                     arableArea: 800.0
 *                     vegetationArea: 200.5
 *                     crops: ["Soja", "Milho"]
 *     responses:
 *       201:
 *         description: Producer created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Producer'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       409:
 *         description: Producer with this CPF/CNPJ already exists
 *       500:
 *         description: Internal server error
 */
router.post('/', validateProducer, createProducer);

/**
 * @swagger
 * /api/producers:
 *   get:
 *     tags: [Producers]
 *     summary: Get all rural producers
 *     description: Retrieves a paginated list of rural producers with optional filtering and searching capabilities.
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
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
 *         example: "São Paulo"
 *       - in: query
 *         name: crops
 *         schema:
 *           type: string
 *         description: Filter by crop type
 *         example: "Soja"
 *     responses:
 *       200:
 *         description: List of producers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginationResponse'
 *       500:
 *         description: Internal server error
 */
router.get('/', getProducers);

/**
 * @swagger
 * /api/producers/{id}:
 *   get:
 *     tags: [Producers]
 *     summary: Get a rural producer by ID
 *     description: Retrieves detailed information about a specific rural producer including their farms.
 *     parameters:
 *       - $ref: '#/components/parameters/ProducerIdParam'
 *     responses:
 *       200:
 *         description: Producer found
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Producer'
 *       404:
 *         description: Producer not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getProducerById);

/**
 * @swagger
 * /api/producers/{id}:
 *   put:
 *     tags: [Producers]
 *     summary: Update a rural producer
 *     description: Updates an existing rural producer's information. CPF/CNPJ validation is performed.
 *     parameters:
 *       - $ref: '#/components/parameters/ProducerIdParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProducerRequest'
 *     responses:
 *       200:
 *         description: Producer updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Producer'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationError'
 *       404:
 *         description: Producer not found
 *       409:
 *         description: Producer with this CPF/CNPJ already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id', validateProducer, updateProducer);

/**
 * @swagger
 * /api/producers/{id}:
 *   delete:
 *     tags: [Producers]
 *     summary: Delete a rural producer
 *     description: Permanently deletes a rural producer and all associated farms. This action cannot be undone.
 *     parameters:
 *       - $ref: '#/components/parameters/ProducerIdParam'
 *     responses:
 *       200:
 *         description: Producer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Producer not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', deleteProducer);

export default router;

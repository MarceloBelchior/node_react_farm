import request from 'supertest';
import express from 'express';
import { Producer } from '../../models/Producer';
import { Farm } from '../../models/Farm';
import { 
  getDashboardStats, 
  getFarmsByState, 
  getCropDistribution, 
  getLandUseDistribution
} from '../../controllers/dashboard.controller';
import { errorHandler } from '../../middleware/errorHandler';

const app = express();
app.use(express.json());

// Setup routes for testing
app.get('/dashboard/stats', getDashboardStats);
app.get('/dashboard/farms-by-state', getFarmsByState);
app.get('/dashboard/crop-distribution', getCropDistribution);
app.get('/dashboard/land-use', getLandUseDistribution);
app.use(errorHandler);

describe('Dashboard Controller', () => {
  let testProducer: any;

  beforeEach(async () => {
    // Create test producer
    testProducer = await Producer.create({
      name: 'Test Producer',
      cpfCnpj: '12345678901',
      email: 'test@email.com',
      phone: '(11) 99999-9999',
      address: {
        street: 'Test Street',
        city: 'Test City',
        state: 'SP',
        zipCode: '12345-678'
      }
    });

    // Create test farms with different crops and states
    await Farm.create([
      {
        name: 'Farm SP 1',
        producerId: testProducer._id,
        state: 'SP',
        city: 'Ribeirão Preto',
        totalArea: 1000,
        agriculturalArea: 800,
        vegetationArea: 200,
        crops: [
          { name: 'Soja', season: '2024', plantedArea: 400 },
          { name: 'Milho', season: '2024', plantedArea: 400 }
        ]
      },
      {
        name: 'Farm MT 1',
        producerId: testProducer._id,
        state: 'MT',
        city: 'Cuiabá',
        totalArea: 2000,
        agriculturalArea: 1600,
        vegetationArea: 400,
        crops: [
          { name: 'Soja', season: '2024', plantedArea: 800 },
          { name: 'Algodão', season: '2024', plantedArea: 800 }
        ]
      },
      {
        name: 'Farm GO 1',
        producerId: testProducer._id,
        state: 'GO',
        city: 'Rio Verde',
        totalArea: 1500,
        agriculturalArea: 1200,
        vegetationArea: 300,
        crops: [
          { name: 'Milho', season: '2024', plantedArea: 600 },
          { name: 'Feijão', season: '2024', plantedArea: 600 }
        ]
      }
    ]);
  });

  describe('GET /dashboard/stats', () => {
    it('should return general dashboard statistics', async () => {
      const response = await request(app)
        .get('/dashboard/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('totalFarms');
      expect(response.body.data).toHaveProperty('totalProducers');
      expect(response.body.data).toHaveProperty('totalArea');
      expect(response.body.data).toHaveProperty('totalAgriculturalArea');
      expect(response.body.data).toHaveProperty('totalVegetationArea');

      expect(response.body.data.totalFarms).toBe(3);
      expect(response.body.data.totalProducers).toBe(1);
      expect(response.body.data.totalArea).toBe(4500); // 1000 + 2000 + 1500
      expect(response.body.data.totalAgriculturalArea).toBe(3600); // 800 + 1600 + 1200
      expect(response.body.data.totalVegetationArea).toBe(900); // 200 + 400 + 300
    });

    it('should return zero stats when no data exists', async () => {
      // Clear all data
      await Farm.deleteMany({});
      await Producer.deleteMany({});

      const response = await request(app)
        .get('/dashboard/stats')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalFarms).toBe(0);
      expect(response.body.data.totalProducers).toBe(0);
      expect(response.body.data.totalArea).toBe(0);
    });
  });

  describe('GET /dashboard/farms-by-state', () => {
    it('should return farms grouped by state', async () => {
      const response = await request(app)
        .get('/dashboard/farms-by-state')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(3);

      // Check if all states are represented
      const states = response.body.data.map((item: any) => item._id);
      expect(states).toContain('SP');
      expect(states).toContain('MT');
      expect(states).toContain('GO');

      // Check farm counts
      response.body.data.forEach((item: any) => {
        expect(item.count).toBe(1);
      });
    });
  });

  describe('GET /dashboard/crop-distribution', () => {
    it('should return crop distribution data', async () => {
      const response = await request(app)
        .get('/dashboard/crop-distribution')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);

      // Check if expected crops are present
      const crops = response.body.data.map((item: any) => item._id);
      expect(crops).toContain('Soja');
      expect(crops).toContain('Milho');
      expect(crops).toContain('Algodão');
      expect(crops).toContain('Feijão');

      // Verify total planted areas
      const sojaData = response.body.data.find((item: any) => item._id === 'Soja');
      expect(sojaData.totalPlantedArea).toBe(1200); // 400 + 800

      const milhoData = response.body.data.find((item: any) => item._id === 'Milho');
      expect(milhoData.totalPlantedArea).toBe(1000); // 400 + 600
    });
  });

  describe('GET /dashboard/land-use', () => {
    it('should return land use distribution', async () => {
      const response = await request(app)
        .get('/dashboard/land-use')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('agriculturalArea');
      expect(response.body.data).toHaveProperty('vegetationArea');
      expect(response.body.data).toHaveProperty('totalArea');

      expect(response.body.data.agriculturalArea).toBe(3600);
      expect(response.body.data.vegetationArea).toBe(900);
      expect(response.body.data.totalArea).toBe(4500);

      // Check percentages
      expect(response.body.data.agriculturalPercentage).toBeCloseTo(80); // 3600/4500 * 100
      expect(response.body.data.vegetationPercentage).toBeCloseTo(20); // 900/4500 * 100
    });

    it('should handle edge case with no farms', async () => {
      await Farm.deleteMany({});

      const response = await request(app)
        .get('/dashboard/land-use')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.totalArea).toBe(0);
      expect(response.body.data.agriculturalPercentage).toBe(0);
      expect(response.body.data.vegetationPercentage).toBe(0);
    });
  });
});

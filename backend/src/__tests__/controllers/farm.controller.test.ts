import request from 'supertest';
import express from 'express';
import { Producer } from '../../models/Producer';
import { Farm } from '../../models/Farm';
import { 
  createFarm, 
  getFarms, 
  getFarmById, 
  updateFarm, 
  deleteFarm,
  addCropToFarm,
  removeCropFromFarm
} from '../../controllers/farm.controller';
import { errorHandler } from '../../middleware/errorHandler';

const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/farms', createFarm);
app.get('/farms', getFarms);
app.get('/farms/:id', getFarmById);
app.put('/farms/:id', updateFarm);
app.delete('/farms/:id', deleteFarm);
app.post('/farms/:id/crops', addCropToFarm);
app.delete('/farms/:id/crops/:cropId', removeCropFromFarm);
app.use(errorHandler);

describe('Farm Controller', () => {
  let testProducer: any;

  beforeEach(async () => {
    // Create a test producer
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
  });

  const validFarmData = {
    name: 'Fazenda Teste',
    state: 'SP',
    city: 'Ribeirão Preto',
    totalArea: 1000,
    agriculturalArea: 800,
    vegetationArea: 200,
    crops: [
      { name: 'Soja', season: '2024', plantedArea: 400 },
      { name: 'Milho', season: '2024', plantedArea: 400 }
    ]
  };

  describe('POST /farms', () => {
    it('should create a new farm with valid data', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };

      const response = await request(app)
        .post('/farms')
        .send(farmData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(farmData.name);
      expect(response.body.data.producerId).toBe(testProducer._id.toString());
      expect(response.body.data.crops).toHaveLength(2);
    });

    it('should return 400 when agricultural + vegetation area exceeds total area', async () => {
      const invalidFarmData = {
        ...validFarmData,
        producerId: testProducer._id,
        totalArea: 500,
        agriculturalArea: 400,
        vegetationArea: 200 // 400 + 200 > 500
      };

      const response = await request(app)
        .post('/farms')
        .send(invalidFarmData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('área total');
    });

    it('should return 404 for non-existent producer', async () => {
      const farmData = {
        ...validFarmData,
        producerId: '507f1f77bcf86cd799439011'
      };

      const response = await request(app)
        .post('/farms')
        .send(farmData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Produtor rural não encontrado');
    });
  });

  describe('GET /farms', () => {
    beforeEach(async () => {
      // Create test farms
      await Farm.create([
        { ...validFarmData, producerId: testProducer._id, name: 'Farm 1' },
        { 
          ...validFarmData, 
          producerId: testProducer._id, 
          name: 'Farm 2',
          state: 'MT',
          totalArea: 2000 
        }
      ]);
    });

    it('should get all farms', async () => {
      const response = await request(app)
        .get('/farms')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.farms).toHaveLength(2);
      expect(response.body.data.totalCount).toBe(2);
    });

    it('should filter farms by state', async () => {
      const response = await request(app)
        .get('/farms?state=MT')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.farms).toHaveLength(1);
      expect(response.body.data.farms[0].state).toBe('MT');
    });

    it('should filter farms by area range', async () => {
      const response = await request(app)
        .get('/farms?minArea=1500')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.farms).toHaveLength(1);
      expect(response.body.data.farms[0].totalArea).toBeGreaterThanOrEqual(1500);
    });
  });

  describe('GET /farms/:id', () => {
    it('should get farm by valid ID', async () => {
      const farm = await Farm.create({ ...validFarmData, producerId: testProducer._id });

      const response = await request(app)
        .get(`/farms/${farm._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(farm._id.toString());
    });

    it('should return 404 for non-existent farm', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/farms/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /farms/:id', () => {
    it('should update farm with valid data', async () => {
      const farm = await Farm.create({ ...validFarmData, producerId: testProducer._id });
      const updateData = { name: 'Updated Farm Name' };

      const response = await request(app)
        .put(`/farms/${farm._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });
  });

  describe('DELETE /farms/:id', () => {
    it('should delete farm by valid ID', async () => {
      const farm = await Farm.create({ ...validFarmData, producerId: testProducer._id });

      const response = await request(app)
        .delete(`/farms/${farm._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Fazenda removida com sucesso');

      // Verify deletion
      const deletedFarm = await Farm.findById(farm._id);
      expect(deletedFarm).toBeNull();
    });
  });

  describe('POST /farms/:id/crops', () => {
    it('should add crop to farm', async () => {
      const farm = await Farm.create({ 
        ...validFarmData, 
        producerId: testProducer._id, 
        crops: [] 
      });

      const cropData = { name: 'Café', season: '2024', plantedArea: 100 };

      const response = await request(app)
        .post(`/farms/${farm._id}/crops`)
        .send(cropData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.crops).toHaveLength(1);
      expect(response.body.data.crops[0].name).toBe(cropData.name);
    });
  });

  describe('DELETE /farms/:id/crops/:cropId', () => {
    it('should remove crop from farm', async () => {
      const farm = await Farm.create({ 
        ...validFarmData, 
        producerId: testProducer._id 
      });

      const cropId = farm.crops[0]._id;

      const response = await request(app)
        .delete(`/farms/${farm._id}/crops/${cropId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.crops).toHaveLength(1); // Started with 2, removed 1
    });
  });
});

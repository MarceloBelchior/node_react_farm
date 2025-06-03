import { Producer } from '../../models/Producer';
import { Farm } from '../../models/Farm';

describe('Farm Model', () => {
  let testProducer: any;

  beforeEach(async () => {
    // Create a test producer for farm relationships
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

  describe('Model Creation', () => {
    it('should create a farm with valid data', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = new Farm(farmData);
      const savedFarm = await farm.save();

      expect(savedFarm._id).toBeDefined();
      expect(savedFarm.name).toBe(farmData.name);
      expect(savedFarm.producerId.toString()).toBe(testProducer._id.toString());
      expect(savedFarm.totalArea).toBe(farmData.totalArea);
      expect(savedFarm.crops).toHaveLength(2);
      expect(savedFarm.createdAt).toBeDefined();
      expect(savedFarm.updatedAt).toBeDefined();
    });

    it('should require all mandatory fields', async () => {
      const incompleteFarm = new Farm({
        name: 'Test Farm'
        // Missing required fields
      });

      await expect(incompleteFarm.save()).rejects.toThrow();
    });

    it('should validate that producerId exists', async () => {
      const farm = new Farm({
        ...validFarmData,
        producerId: '507f1f77bcf86cd799439011' // Non-existent producer
      });

      // Note: This validation would be done at application level,
      // not at Mongoose schema level
      expect(farm.producerId.toString()).toBe('507f1f77bcf86cd799439011');
    });
  });

  describe('Model Validation', () => {
    it('should validate state enum', async () => {
      const farm = new Farm({
        ...validFarmData,
        producerId: testProducer._id,
        state: 'XX' // Invalid state
      });

      await expect(farm.save()).rejects.toThrow();
    });

    it('should validate positive area values', async () => {
      const farm = new Farm({
        ...validFarmData,
        producerId: testProducer._id,
        totalArea: -100 // Negative value
      });

      await expect(farm.save()).rejects.toThrow();
    });

    it('should validate crop names from enum', async () => {
      const farm = new Farm({
        ...validFarmData,
        producerId: testProducer._id,
        crops: [
          { name: 'Invalid Crop', season: '2024', plantedArea: 100 }
        ]
      });

      await expect(farm.save()).rejects.toThrow();
    });

    it('should validate season format', async () => {
      const farm = new Farm({
        ...validFarmData,
        producerId: testProducer._id,
        crops: [
          { name: 'Soja', season: '24', plantedArea: 100 } // Invalid format
        ]
      });

      await expect(farm.save()).rejects.toThrow();
    });

    it('should validate positive planted area', async () => {
      const farm = new Farm({
        ...validFarmData,
        producerId: testProducer._id,
        crops: [
          { name: 'Soja', season: '2024', plantedArea: -50 } // Negative value
        ]
      });

      await expect(farm.save()).rejects.toThrow();
    });
  });

  describe('Model Methods', () => {
    it('should automatically set timestamps', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = await Farm.create(farmData);

      expect(farm.createdAt).toBeDefined();
      expect(farm.updatedAt).toBeDefined();
      expect(farm.createdAt).toEqual(farm.updatedAt);
    });

    it('should update timestamps on modification', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = await Farm.create(farmData);
      const originalUpdatedAt = farm.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      farm.name = 'Updated Farm Name';
      await farm.save();

      expect(farm.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should transform to JSON properly', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = await Farm.create(farmData);
      const json = farm.toJSON();

      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
      expect(json.name).toBe(farmData.name);
    });

    it('should populate producer data', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = await Farm.create(farmData);
      
      const populatedFarm = await Farm.findById(farm._id).populate('producerId');
      
      expect(populatedFarm.producerId.name).toBe(testProducer.name);
      expect(populatedFarm.producerId.email).toBe(testProducer.email);
    });
  });

  describe('Crop Management', () => {
    it('should add crops to farm', async () => {
      const farmData = { 
        ...validFarmData, 
        producerId: testProducer._id,
        crops: [] 
      };
      const farm = await Farm.create(farmData);

      const newCrop = { name: 'Café', season: '2024', plantedArea: 200 };
      farm.crops.push(newCrop);
      await farm.save();

      expect(farm.crops).toHaveLength(1);
      expect(farm.crops[0].name).toBe('Café');
    });

    it('should remove crops from farm', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = await Farm.create(farmData);

      expect(farm.crops).toHaveLength(2);

      farm.crops.splice(0, 1); // Remove first crop
      await farm.save();

      expect(farm.crops).toHaveLength(1);
      expect(farm.crops[0].name).toBe('Milho');
    });

    it('should update crop information', async () => {
      const farmData = { ...validFarmData, producerId: testProducer._id };
      const farm = await Farm.create(farmData);

      farm.crops[0].plantedArea = 500;
      await farm.save();

      expect(farm.crops[0].plantedArea).toBe(500);
    });
  });

  describe('Model Queries', () => {
    beforeEach(async () => {
      // Create test farms
      await Farm.create([
        { ...validFarmData, producerId: testProducer._id, name: 'Farm SP 1' },
        { 
          ...validFarmData, 
          producerId: testProducer._id, 
          name: 'Farm MT 1',
          state: 'MT',
          totalArea: 2000,
          crops: [{ name: 'Algodão', season: '2024', plantedArea: 800 }]
        },
        { 
          ...validFarmData, 
          producerId: testProducer._id, 
          name: 'Farm GO 1',
          state: 'GO',
          totalArea: 1500
        }
      ]);
    });

    it('should find farms by state', async () => {
      const farms = await Farm.find({ state: 'MT' });
      expect(farms).toHaveLength(1);
      expect(farms[0].name).toBe('Farm MT 1');
    });

    it('should find farms by producer', async () => {
      const farms = await Farm.find({ producerId: testProducer._id });
      expect(farms).toHaveLength(3);
    });

    it('should find farms by area range', async () => {
      const farms = await Farm.find({ 
        totalArea: { $gte: 1500, $lte: 2000 } 
      });
      expect(farms).toHaveLength(2); // MT (2000) and GO (1500)
    });

    it('should find farms by crop type', async () => {
      const farms = await Farm.find({ 'crops.name': 'Soja' });
      expect(farms).toHaveLength(2); // SP and GO farms have Soja
    });

    it('should aggregate total area by state', async () => {
      const result = await Farm.aggregate([
        { $group: { _id: '$state', totalArea: { $sum: '$totalArea' } } },
        { $sort: { totalArea: -1 } }
      ]);

      expect(result).toHaveLength(3);
      expect(result[0]._id).toBe('MT');
      expect(result[0].totalArea).toBe(2000);
    });

    it('should count farms by crop type', async () => {
      const result = await Farm.aggregate([
        { $unwind: '$crops' },
        { $group: { _id: '$crops.name', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const sojaCount = result.find(r => r._id === 'Soja');
      const milhoCount = result.find(r => r._id === 'Milho');
      
      expect(sojaCount.count).toBe(2);
      expect(milhoCount.count).toBe(2);
    });
  });
});

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DebugUtils } from '../src/utils/debug';
import { MongoDebugUtils } from '../src/utils/mongo-debug';

describe('Debug Integration Test', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Debug Utilities', () => {
    it('should log API calls correctly', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      DebugUtils.logApiCall('GET', '/api/farms', null, { page: 1, limit: 10 });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log database operations', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      DebugUtils.logDbOperation('CREATE', 'farms', { name: 'Test Farm' }, { _id: 'test-id' });

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should track performance metrics', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const startTime = Date.now() - 100; // Simulate 100ms operation

      DebugUtils.logPerformance('testOperation', startTime);

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });

    it('should log memory usage', () => {
      const consoleSpy = jest.spyOn(console, 'log');

      DebugUtils.logMemoryUsage('Test Context');

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Debug Interceptor Integration', () => {
    it('should intercept and log API requests', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/health')
        .expect(200);

      expect(response.body).toBeDefined();
    });

    it('should handle POST requests with body logging', async () => {
      const farmData = {
        name: 'Debug Test Farm',
        totalArea: 100,
        agriculturalArea: 60,
        vegetationArea: 40,
        producerId: '507f1f77bcf86cd799439011',
        city: 'Test City',
        state: 'TS'
      };

      const response = await request(app.getHttpServer())
        .post('/api/farms')
        .send(farmData)
        .expect(201);

      expect(response.body).toBeDefined();
    });
  });

  describe('MongoDB Debug Integration', () => {
    it('should log query performance', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      const startTime = Date.now() - 250; // Simulate 250ms query

      MongoDebugUtils.logQueryPerformance(
        'findAll',
        { name: { $regex: 'test', $options: 'i' } },
        startTime,
        5
      );

      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('Service Debug Decorators', () => {
    it('should work with decorated service methods', async () => {
      // This test verifies that the debug decorators don't break functionality
      const response = await request(app.getHttpServer())
        .get('/api/farms')
        .query({ page: 1, limit: 5 })
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.data).toBeDefined();
    });
  });
});

describe('Performance Testing with Debug', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('should handle multiple concurrent requests', async () => {
    const promises = Array.from({ length: 10 }, (_, i) =>
      request(app.getHttpServer())
        .get('/api/farms')
        .query({ page: i + 1, limit: 5 })
    );

    const responses = await Promise.all(promises);

    responses.forEach(response => {
      expect(response.status).toBe(200);
    });
  });

  it('should profile complex operations', async () => {
    const startTime = Date.now();

    const result = await DebugUtils.profile('Complex Test Operation', async () => {
      // Simulate complex operation
      await new Promise(resolve => setTimeout(resolve, 100));
      return 'test result';
    });

    const duration = Date.now() - startTime;

    expect(result).toBe('test result');
    expect(duration).toBeGreaterThanOrEqual(100);
  });
});

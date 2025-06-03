import request from 'supertest';
import express from 'express';
import { Producer } from '../../models/Producer';
import { 
  createProducer, 
  getProducers, 
  getProducerById, 
  updateProducer, 
  deleteProducer 
} from '../../controllers/producer.controller';
import { errorHandler } from '../../middleware/errorHandler';

const app = express();
app.use(express.json());

// Setup routes for testing
app.post('/producers', createProducer);
app.get('/producers', getProducers);
app.get('/producers/:id', getProducerById);
app.put('/producers/:id', updateProducer);
app.delete('/producers/:id', deleteProducer);
app.use(errorHandler);

describe('Producer Controller', () => {
  const validProducerData = {
    name: 'João Silva',
    cpfCnpj: '12345678901',
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    address: {
      street: 'Rua das Flores, 123',
      city: 'Ribeirão Preto',
      state: 'SP',
      zipCode: '14000-000'
    }
  };

  describe('POST /producers', () => {
    it('should create a new producer with valid data', async () => {
      const response = await request(app)
        .post('/producers')
        .send(validProducerData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(validProducerData.name);
      expect(response.body.data.cpfCnpj).toBe(validProducerData.cpfCnpj);
      expect(response.body.data.email).toBe(validProducerData.email);
    });

    it('should return 400 for duplicate CPF/CNPJ', async () => {
      // Create first producer
      await Producer.create(validProducerData);

      // Try to create duplicate
      const response = await request(app)
        .post('/producers')
        .send({ ...validProducerData, email: 'different@email.com' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('CPF/CNPJ já cadastrado');
    });

    it('should return 400 for duplicate email', async () => {
      // Create first producer
      await Producer.create(validProducerData);

      // Try to create duplicate
      const response = await request(app)
        .post('/producers')
        .send({ ...validProducerData, cpfCnpj: '98765432100' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('E-mail já cadastrado');
    });
  });

  describe('GET /producers', () => {
    beforeEach(async () => {
      // Create test producers
      await Producer.create([
        validProducerData,
        {
          ...validProducerData,
          name: 'Maria Santos',
          cpfCnpj: '98765432100',
          email: 'maria@email.com',
          address: { ...validProducerData.address, state: 'MT' }
        }
      ]);
    });

    it('should get all producers', async () => {
      const response = await request(app)
        .get('/producers')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.producers).toHaveLength(2);
      expect(response.body.data.totalCount).toBe(2);
    });

    it('should filter producers by state', async () => {
      const response = await request(app)
        .get('/producers?state=MT')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.producers).toHaveLength(1);
      expect(response.body.data.producers[0].address.state).toBe('MT');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/producers?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.producers).toHaveLength(1);
      expect(response.body.data.pagination.currentPage).toBe(1);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /producers/:id', () => {
    it('should get producer by valid ID', async () => {
      const producer = await Producer.create(validProducerData);

      const response = await request(app)
        .get(`/producers/${producer._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(producer._id.toString());
    });

    it('should return 404 for non-existent ID', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .get(`/producers/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Produtor rural não encontrado');
    });

    it('should return 400 for invalid ID format', async () => {
      const response = await request(app)
        .get('/producers/invalid-id')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /producers/:id', () => {
    it('should update producer with valid data', async () => {
      const producer = await Producer.create(validProducerData);
      const updateData = { name: 'João Silva Updated' };

      const response = await request(app)
        .put(`/producers/${producer._id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe(updateData.name);
    });

    it('should return 404 for non-existent producer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .put(`/producers/${fakeId}`)
        .send({ name: 'Updated Name' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /producers/:id', () => {
    it('should delete producer by valid ID', async () => {
      const producer = await Producer.create(validProducerData);

      const response = await request(app)
        .delete(`/producers/${producer._id}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Produtor rural removido com sucesso');

      // Verify deletion
      const deletedProducer = await Producer.findById(producer._id);
      expect(deletedProducer).toBeNull();
    });

    it('should return 404 for non-existent producer', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      
      const response = await request(app)
        .delete(`/producers/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });
});

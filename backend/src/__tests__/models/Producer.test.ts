import { Producer } from '../../models/Producer';

describe('Producer Model', () => {
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

  describe('Model Creation', () => {
    it('should create a producer with valid data', async () => {
      const producer = new Producer(validProducerData);
      const savedProducer = await producer.save();

      expect(savedProducer._id).toBeDefined();
      expect(savedProducer.name).toBe(validProducerData.name);
      expect(savedProducer.cpfCnpj).toBe(validProducerData.cpfCnpj);
      expect(savedProducer.email).toBe(validProducerData.email);
      expect(savedProducer.createdAt).toBeDefined();
      expect(savedProducer.updatedAt).toBeDefined();
    });

    it('should enforce unique cpfCnpj constraint', async () => {
      // Create first producer
      await Producer.create(validProducerData);

      // Try to create second producer with same CPF/CNPJ
      const duplicateProducer = new Producer({
        ...validProducerData,
        email: 'different@email.com'
      });

      await expect(duplicateProducer.save()).rejects.toThrow();
    });

    it('should enforce unique email constraint', async () => {
      // Create first producer
      await Producer.create(validProducerData);

      // Try to create second producer with same email
      const duplicateProducer = new Producer({
        ...validProducerData,
        cpfCnpj: '98765432100'
      });

      await expect(duplicateProducer.save()).rejects.toThrow();
    });

    it('should require all mandatory fields', async () => {
      const incompleteProducer = new Producer({
        name: 'Test Producer'
        // Missing required fields
      });

      await expect(incompleteProducer.save()).rejects.toThrow();
    });
  });

  describe('Model Validation', () => {
    it('should validate email format', async () => {
      const producer = new Producer({
        ...validProducerData,
        email: 'invalid-email'
      });

      await expect(producer.save()).rejects.toThrow();
    });

    it('should validate phone format', async () => {
      const producer = new Producer({
        ...validProducerData,
        phone: 'invalid-phone'
      });

      await expect(producer.save()).rejects.toThrow();
    });

    it('should validate state enum', async () => {
      const producer = new Producer({
        ...validProducerData,
        address: {
          ...validProducerData.address,
          state: 'XX' // Invalid state
        }
      });

      await expect(producer.save()).rejects.toThrow();
    });

    it('should validate zipCode format', async () => {
      const producer = new Producer({
        ...validProducerData,
        address: {
          ...validProducerData.address,
          zipCode: '123' // Invalid format
        }
      });

      await expect(producer.save()).rejects.toThrow();
    });
  });

  describe('Model Methods', () => {
    it('should automatically set timestamps', async () => {
      const producer = await Producer.create(validProducerData);

      expect(producer.createdAt).toBeDefined();
      expect(producer.updatedAt).toBeDefined();
      expect(producer.createdAt).toEqual(producer.updatedAt);
    });

    it('should update timestamps on modification', async () => {
      const producer = await Producer.create(validProducerData);
      const originalUpdatedAt = producer.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      producer.name = 'Updated Name';
      await producer.save();

      expect(producer.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });

    it('should transform to JSON properly', async () => {
      const producer = await Producer.create(validProducerData);
      const json = producer.toJSON();

      expect(json.id).toBeDefined();
      expect(json._id).toBeUndefined();
      expect(json.__v).toBeUndefined();
      expect(json.name).toBe(validProducerData.name);
    });
  });

  describe('Model Queries', () => {
    beforeEach(async () => {
      // Create test data
      await Producer.create([
        validProducerData,
        {
          ...validProducerData,
          name: 'Maria Santos',
          cpfCnpj: '98765432100',
          email: 'maria@email.com',
          address: { ...validProducerData.address, state: 'MT' }
        },
        {
          ...validProducerData,
          name: 'Carlos Oliveira',
          cpfCnpj: '11122233344',
          email: 'carlos@email.com',
          address: { ...validProducerData.address, state: 'GO' }
        }
      ]);
    });

    it('should find producers by state', async () => {
      const producers = await Producer.find({ 'address.state': 'MT' });
      expect(producers).toHaveLength(1);
      expect(producers[0].name).toBe('Maria Santos');
    });

    it('should find producers by name pattern', async () => {
      const producers = await Producer.find({ 
        name: { $regex: 'Silva', $options: 'i' } 
      });
      expect(producers).toHaveLength(1);
      expect(producers[0].name).toBe('João Silva');
    });

    it('should count total producers', async () => {
      const count = await Producer.countDocuments();
      expect(count).toBe(3);
    });

    it('should sort producers by name', async () => {
      const producers = await Producer.find().sort({ name: 1 });
      expect(producers[0].name).toBe('Carlos Oliveira');
      expect(producers[1].name).toBe('João Silva');
      expect(producers[2].name).toBe('Maria Santos');
    });
  });
});

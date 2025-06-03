import { Request, Response, NextFunction } from 'express';
import { 
  validateProducer, 
  validateFarm, 
  validateCrop,
  createProducerSchema,
  createFarmSchema
} from '../../middleware/validation';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  describe('Producer Validation', () => {
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

    it('should pass validation with valid producer data', () => {
      mockRequest.body = validProducerData;

      validateProducer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid CPF', () => {
      mockRequest.body = {
        ...validProducerData,
        cpfCnpj: '12345'
      };

      validateProducer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: 'Dados inválidos fornecidos'
        })
      );
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid email', () => {
      mockRequest.body = {
        ...validProducerData,
        email: 'invalid-email'
      };

      validateProducer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid state', () => {
      mockRequest.body = {
        ...validProducerData,
        address: {
          ...validProducerData.address,
          state: 'XX'
        }
      };

      validateProducer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with missing required fields', () => {
      mockRequest.body = {
        name: 'João Silva'
        // Missing required fields
      };

      validateProducer(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Farm Validation', () => {
    const validFarmData = {
      name: 'Fazenda Teste',
      producerId: '507f1f77bcf86cd799439011',
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

    it('should pass validation with valid farm data', () => {
      mockRequest.body = validFarmData;

      validateFarm(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation when agricultural + vegetation > total area', () => {
      mockRequest.body = {
        ...validFarmData,
        totalArea: 500,
        agriculturalArea: 400,
        vegetationArea: 200 // 400 + 200 > 500
      };

      validateFarm(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid crop name', () => {
      mockRequest.body = {
        ...validFarmData,
        crops: [
          { name: 'Invalid Crop', season: '2024', plantedArea: 400 }
        ]
      };

      validateFarm(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with negative area values', () => {
      mockRequest.body = {
        ...validFarmData,
        totalArea: -100
      };

      validateFarm(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid season format', () => {
      mockRequest.body = {
        ...validFarmData,
        crops: [
          { name: 'Soja', season: '24', plantedArea: 400 } // Should be YYYY format
        ]
      };

      validateFarm(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Crop Validation', () => {
    const validCropData = {
      name: 'Soja',
      season: '2024',
      plantedArea: 400
    };

    it('should pass validation with valid crop data', () => {
      mockRequest.body = validCropData;

      validateCrop(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should fail validation with invalid crop name', () => {
      mockRequest.body = {
        ...validCropData,
        name: 'Invalid Crop'
      };

      validateCrop(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it('should fail validation with zero planted area', () => {
      mockRequest.body = {
        ...validCropData,
        plantedArea: 0
      };

      validateCrop(mockRequest as Request, mockResponse as Response, nextFunction);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe('Schema Tests', () => {
    it('should validate CPF format correctly', () => {
      const validCpf = { cpfCnpj: '12345678901' };
      const invalidCpf = { cpfCnpj: '123' };

      const { error: validError } = createProducerSchema.validate(validCpf);
      const { error: invalidError } = createProducerSchema.validate(invalidCpf);

      expect(validError).toBeUndefined();
      expect(invalidError).toBeDefined();
    });

    it('should validate CNPJ format correctly', () => {
      const validCnpj = { cpfCnpj: '12345678000199' };
      const invalidCnpj = { cpfCnpj: '12345678000' };

      const { error: validError } = createProducerSchema.validate(validCnpj);
      const { error: invalidError } = createProducerSchema.validate(invalidCnpj);

      expect(validError).toBeUndefined();
      expect(invalidError).toBeDefined();
    });

    it('should validate season year range', () => {
      const currentYear = new Date().getFullYear();
      const validSeason = { season: currentYear.toString() };
      const invalidSeason = { season: '1999' }; // Too old

      const cropSchema = createFarmSchema.extract('crops').items;
      
      const { error: validError } = cropSchema.validate(validSeason);
      const { error: invalidError } = cropSchema.validate(invalidSeason);

      expect(validError).toBeUndefined();
      expect(invalidError).toBeDefined();
    });
  });
});

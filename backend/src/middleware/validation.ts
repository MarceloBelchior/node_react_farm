import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { IApiResponse } from '../types';

// Brazilian states enum for validation
const brazilianStates = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// Available crops enum
const availableCrops = [
  'Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar', 
  'Arroz', 'Feijão', 'Trigo', 'Sorgo', 'Outros'
];

// CPF/CNPJ validation function
const validateCpfCnpj = (value: string): boolean => {
  const cleanValue = value.replace(/[^\d]/g, '');
  
  if (cleanValue.length === 11) {
    return validateCPF(cleanValue);
  }
  
  if (cleanValue.length === 14) {
    return validateCNPJ(cleanValue);
  }
  
  return false;
};

// CPF validation algorithm
function validateCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  
  if (parseInt(cpf[9]) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  
  return parseInt(cpf[10]) === digit2;
}

// CNPJ validation algorithm
function validateCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false;

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  
  if (parseInt(cnpj[12]) !== digit1) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  
  return parseInt(cnpj[13]) === digit2;
}

// Producer validation schemas
export const createProducerSchema = Joi.object({
  cpfCnpj: Joi.string()
    .required()
    .custom((value, helpers) => {
      if (!validateCpfCnpj(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.required': 'CPF/CNPJ é obrigatório',
      'any.invalid': 'CPF/CNPJ inválido'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
      'any.required': 'Nome é obrigatório'
    })
});

export const updateProducerSchema = Joi.object({
  cpfCnpj: Joi.string()
    .custom((value, helpers) => {
      if (!validateCpfCnpj(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .messages({
      'any.invalid': 'CPF/CNPJ inválido'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'string.max': 'Nome deve ter no máximo 100 caracteres'
    })
});

// Farm validation schemas
export const createFarmSchema = Joi.object({
  producerId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'ID do produtor inválido',
      'any.required': 'ID do produtor é obrigatório'
    }),
  name: Joi.string()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.min': 'Nome da fazenda deve ter pelo menos 2 caracteres',
      'string.max': 'Nome da fazenda deve ter no máximo 100 caracteres',
      'any.required': 'Nome da fazenda é obrigatório'
    }),
  city: Joi.string()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.min': 'Nome da cidade deve ter pelo menos 2 caracteres',
      'string.max': 'Nome da cidade deve ter no máximo 50 caracteres',
      'any.required': 'Cidade é obrigatória'
    }),
  state: Joi.string()
    .valid(...brazilianStates)
    .required()
    .messages({
      'any.only': 'Estado deve ser uma sigla válida brasileira',
      'any.required': 'Estado é obrigatório'
    }),
  totalArea: Joi.number()
    .min(0.1)
    .max(1000000)
    .required()
    .messages({
      'number.min': 'Área total deve ser maior que 0.1 hectare',
      'number.max': 'Área total não pode exceder 1.000.000 hectares',
      'any.required': 'Área total é obrigatória'
    }),
  agriculturalArea: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Área agricultável deve ser maior ou igual a 0',
      'any.required': 'Área agricultável é obrigatória'
    }),
  vegetationArea: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Área de vegetação deve ser maior ou igual a 0',
      'any.required': 'Área de vegetação é obrigatória'
    }),
  crops: Joi.array()
    .items(
      Joi.object({
        name: Joi.string()
          .valid(...availableCrops)
          .required()
          .messages({
            'any.only': 'Cultura deve ser uma das opções válidas',
            'any.required': 'Nome da cultura é obrigatório'
          }),
        harvest: Joi.string()
          .pattern(/^\d{4}$/)
          .custom((value, helpers) => {
            const year = parseInt(value);
            const currentYear = new Date().getFullYear();
            if (year < 2000 || year > currentYear + 5) {
              return helpers.error('any.invalid');
            }
            return value;
          })
          .required()
          .messages({
            'string.pattern.base': 'Safra deve estar no formato AAAA',
            'any.invalid': 'Safra deve ser um ano válido entre 2000 e 5 anos no futuro',
            'any.required': 'Safra é obrigatória'
          }),
        plantedArea: Joi.number()
          .min(0)
          .messages({
            'number.min': 'Área plantada deve ser maior ou igual a 0'
          })
      })
    )
    .default([])
})
.custom((value, helpers) => {
  // Custom validation to ensure agricultural + vegetation <= total area
  if (value.agriculturalArea + value.vegetationArea > value.totalArea) {
    return helpers.error('any.invalid');
  }
  return value;
})
.messages({
  'any.invalid': 'A soma das áreas agricultável e de vegetação não pode exceder a área total'
});

export const updateFarmSchema = createFarmSchema.fork(['producerId'], (schema) => schema.optional());

// Validation middleware
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      const response: IApiResponse = {
        success: false,
        error: 'Dados inválidos fornecidos',
        data: errors
      };

      res.status(400).json(response);
      return;
    }

    req.body = value;
    next();
  };
};

// Specific validation middleware functions
export const validateProducer = validate(createProducerSchema);
export const validateProducerUpdate = validate(updateProducerSchema);
export const validateFarm = validate(createFarmSchema);
export const validateFarmUpdate = validate(updateFarmSchema);

// Crop validation schema and middleware
const cropSchema = Joi.object({
  name: Joi.string()
    .valid(...availableCrops)
    .required()
    .messages({
      'any.only': `Cultura deve ser uma das opções: ${availableCrops.join(', ')}`,
      'any.required': 'Nome da cultura é obrigatório'
    }),
  season: Joi.string()
    .pattern(/^\d{4}$/)
    .custom((value, helpers) => {
      const year = parseInt(value);
      const currentYear = new Date().getFullYear();
      if (year < 2000 || year > currentYear + 5) {
        return helpers.error('any.invalid');
      }
      return value;
    })
    .required()
    .messages({
      'string.pattern.base': 'Safra deve estar no formato AAAA',
      'any.invalid': 'Safra deve ser um ano válido entre 2000 e 5 anos no futuro',
      'any.required': 'Safra é obrigatória'
    }),
  plantedArea: Joi.number()
    .min(0)
    .required()
    .messages({
      'number.min': 'Área plantada deve ser maior que 0',
      'any.required': 'Área plantada é obrigatória'
    })
});

export const validateCrop = validate(cropSchema);

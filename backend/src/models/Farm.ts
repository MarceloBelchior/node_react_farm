import mongoose, { Schema, Document } from 'mongoose';
import { IFarm, ICrop } from '../types';

export interface IFarmDocument extends Omit<IFarm, '_id'>, Document {}

const CropSchema = new Schema<ICrop>({
  name: {
    type: String,
    required: [true, 'Nome da cultura é obrigatório'],
    trim: true,
    enum: {
      values: ['Soja', 'Milho', 'Algodão', 'Café', 'Cana de Açúcar', 'Arroz', 'Feijão', 'Trigo', 'Sorgo', 'Outros'],
      message: 'Cultura deve ser uma das opções válidas'
    }
  },
  harvest: {
    type: String,
    required: [true, 'Safra é obrigatória'],
    trim: true,
    validate: {
      validator: function(value: string): boolean {
        // Validate year format (YYYY) and reasonable range
        const year = parseInt(value);
        const currentYear = new Date().getFullYear();
        return year >= 2000 && year <= currentYear + 5;
      },
      message: 'Safra deve ser um ano válido entre 2000 e 5 anos no futuro'
    }
  },
  plantedArea: {
    type: Number,
    min: [0, 'Área plantada deve ser maior que 0'],
    validate: {
      validator: function(value: number): boolean {
        return value === undefined || value >= 0;
      },
      message: 'Área plantada deve ser um número positivo'
    }
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const FarmSchema = new Schema<IFarmDocument>({
  producerId: {
    type: String,
    required: [true, 'ID do produtor é obrigatório'],
    validate: {
      validator: function(value: string): boolean {
        return mongoose.Types.ObjectId.isValid(value);
      },
      message: 'ID do produtor inválido'
    }
  },
  name: {
    type: String,
    required: [true, 'Nome da fazenda é obrigatório'],
    trim: true,
    minlength: [2, 'Nome da fazenda deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome da fazenda deve ter no máximo 100 caracteres']
  },
  city: {
    type: String,
    required: [true, 'Cidade é obrigatória'],
    trim: true,
    minlength: [2, 'Nome da cidade deve ter pelo menos 2 caracteres'],
    maxlength: [50, 'Nome da cidade deve ter no máximo 50 caracteres']
  },
  state: {
    type: String,
    required: [true, 'Estado é obrigatório'],
    trim: true,
    uppercase: true,
    enum: {
      values: [
        'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 
        'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 
        'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
      ],
      message: 'Estado deve ser uma sigla válida brasileira'
    }
  },
  totalArea: {
    type: Number,
    required: [true, 'Área total é obrigatória'],
    min: [0.1, 'Área total deve ser maior que 0.1 hectare'],
    max: [1000000, 'Área total não pode exceder 1.000.000 hectares']
  },
  agriculturalArea: {
    type: Number,
    required: [true, 'Área agricultável é obrigatória'],
    min: [0, 'Área agricultável deve ser maior ou igual a 0'],
    validate: {
      validator: function(this: IFarmDocument, value: number): boolean {
        return value + this.vegetationArea <= this.totalArea;
      },
      message: 'A soma das áreas agricultável e de vegetação não pode exceder a área total'
    }
  },
  vegetationArea: {
    type: Number,
    required: [true, 'Área de vegetação é obrigatória'],
    min: [0, 'Área de vegetação deve ser maior ou igual a 0'],
    validate: {
      validator: function(this: IFarmDocument, value: number): boolean {
        return value + this.agriculturalArea <= this.totalArea;
      },
      message: 'A soma das áreas agricultável e de vegetação não pode exceder a área total'
    }
  },
  crops: {
    type: [CropSchema],
    default: [],
    validate: {
      validator: function(crops: ICrop[]): boolean {
        // Check for duplicate crop names in the same harvest
        const seen = new Set();
        for (const crop of crops) {
          const key = `${crop.name}-${crop.harvest}`;
          if (seen.has(key)) {
            return false;
          }
          seen.add(key);
        }
        return true;
      },
      message: 'Não é possível ter a mesma cultura plantada duas vezes na mesma safra'
    }
  }
}, {
  timestamps: true,  toJSON: {
    transform: function(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
FarmSchema.index({ producerId: 1 });
FarmSchema.index({ state: 1 });
FarmSchema.index({ city: 1 });
FarmSchema.index({ 'crops.name': 1 });
FarmSchema.index({ 'crops.harvest': 1 });
FarmSchema.index({ createdAt: -1 });

// Compound indexes for common queries
FarmSchema.index({ producerId: 1, createdAt: -1 });
FarmSchema.index({ state: 1, city: 1 });

export const Farm = mongoose.model<IFarmDocument>('Farm', FarmSchema);

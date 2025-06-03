import mongoose, { Document, Schema } from 'mongoose';
import { IProducer } from '../types';

export interface IProducerDocument extends Omit<IProducer, '_id'>, Document { }

function validateCPF(cpf: string): boolean {
  console.log('Validating CPF:', cpf);

  if (cpf.length !== 11) {
    console.log('CPF length is not 11');
    return false;
  }
  if (/^(\d)\1{10}$/.test(cpf)) {
    console.log('CPF has all same digits');
    return false;
  }

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  console.log('First digit calculation:', { sum, digit1, actual: parseInt(cpf[9]) });

  if (parseInt(cpf[9]) !== digit1) {
    console.log('First digit mismatch');
    return false;
  }

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  console.log('Second digit calculation:', { sum, digit2, actual: parseInt(cpf[10]) });

  const result = parseInt(cpf[10]) === digit2;
  console.log('Final validation result:', result);
  return result;
}

function validateCNPJ(cnpj: string): boolean {
  console.log('Validating CNPJ:', cnpj);

  if (cnpj.length !== 14) {
    console.log('CNPJ length is not 14');
    return false;
  }
  if (/^(\d)\1{13}$/.test(cnpj)) {
    console.log('CNPJ has all same digits');
    return false;
  }

  // Calculate first verification digit
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i];
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;
  console.log('First digit calculation:', { sum, digit1, actual: parseInt(cnpj[12]) });

  if (parseInt(cnpj[12]) !== digit1) {
    console.log('First digit mismatch');
    return false;
  }

  // Calculate second verification digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i];
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;
  console.log('Second digit calculation:', { sum, digit2, actual: parseInt(cnpj[13]) });

  const result = parseInt(cnpj[13]) === digit2;
  console.log('Final validation result:', result);
  return result;
}

const ProducerSchema = new Schema<IProducerDocument>({
  cpfCnpj: {
    type: String,
    required: [true, 'CPF/CNPJ é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function (value: string): boolean {
        console.log('Validating document:', value);

        // Value should be clean at this point
        if (value.length === 11) {
          const result = validateCPF(value);
          console.log('CPF validation result:', result);
          return result;
        }

        if (value.length === 14) {
          const result = validateCNPJ(value);
          console.log('CNPJ validation result:', result);
          return result;
        }

        console.log('Invalid document length:', value.length);
        return false;
      },
      message: 'CPF/CNPJ inválido'
    }
  },
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/, 'Email inválido']
  },
  phone: {
    type: String,
    required: [true, 'Telefone é obrigatório'],
    trim: true
  },
  address: {
    street: {
      type: String,
      required: [true, 'Endereço é obrigatório'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'Cidade é obrigatória'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'Estado é obrigatório'],
      trim: true,
      uppercase: true,
      minlength: [2, 'Estado deve ter 2 caracteres'],
      maxlength: [2, 'Estado deve ter 2 caracteres']
    },
    zipCode: {
      type: String,
      required: [true, 'CEP é obrigatório'],
      trim: true
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function (_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for better query performance
ProducerSchema.index({ name: 1 });
ProducerSchema.index({ createdAt: -1 });

export const Producer = mongoose.model<IProducerDocument>('Producer', ProducerSchema);

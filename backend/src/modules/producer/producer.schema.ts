import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export type ProducerDocument = Producer & Document;

@Schema({
  timestamps: true,
  toJSON: {
    transform: function(_doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
})
export class Producer {
  @ApiProperty({
    description: 'Producer CPF or CNPJ document',
    example: '12345678901',
    pattern: '^[0-9]{11}$|^[0-9]{14}$'
  })
  @Prop({
    required: [true, 'CPF/CNPJ é obrigatório'],
    unique: true,
    trim: true,
    validate: {
      validator: function(value: string): boolean {
        // Remove special characters for validation
        const cleanValue = value.replace(/[^\d]/g, '');
        
        // CPF validation (11 digits)
        if (cleanValue.length === 11) {
          return validateCPF(cleanValue);
        }
        
        // CNPJ validation (14 digits)
        if (cleanValue.length === 14) {
          return validateCNPJ(cleanValue);
        }
        
        return false;
      },
      message: 'CPF/CNPJ inválido'
    }
  })
  cpfCnpj: string;

  @ApiProperty({
    description: 'Producer name',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100
  })
  @Prop({
    required: [true, 'Nome é obrigatório'],
    trim: true,
    minlength: [2, 'Nome deve ter pelo menos 2 caracteres'],
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  })
  name: string;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2025-06-03T17:30:00Z'
  })
  @Transform(({ value }) => value?.toISOString())
  createdAt?: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2025-06-03T17:30:00Z'
  })
  @Transform(({ value }) => value?.toISOString())
  updatedAt?: Date;
}

export const ProducerSchema = SchemaFactory.createForClass(Producer);

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

import { FormErrors } from '../types';

export const validateCPF = (cpf: string): boolean => {
  // Remove non-numeric characters
  const numbers = cpf.replace(/\D/g, '');
  
  if (numbers.length !== 11) return false;
  
  // Check if all digits are the same
  if (numbers.split('').every(digit => digit === numbers[0])) return false;
  
  // Validate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[9]) !== checkDigit1) return false;
  
  // Validate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i);
  }
  remainder = sum % 11;
  let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[10]) === checkDigit2;
};

export const validateCNPJ = (cnpj: string): boolean => {
  // Remove non-numeric characters
  const numbers = cnpj.replace(/\D/g, '');
  
  if (numbers.length !== 14) return false;
  
  // Check if all digits are the same
  if (numbers.split('').every(digit => digit === numbers[0])) return false;
  
  // Validate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(numbers[i]) * weights1[i];
  }
  let remainder = sum % 11;
  let checkDigit1 = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(numbers[12]) !== checkDigit1) return false;
  
  // Validate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(numbers[i]) * weights2[i];
  }
  remainder = sum % 11;
  let checkDigit2 = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(numbers[13]) === checkDigit2;
};

export const validateCpfCnpj = (value: string): boolean => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length === 11) {
    return validateCPF(value);
  } else if (numbers.length === 14) {
    return validateCNPJ(value);
  }
  
  return false;
};

export const formatCpfCnpj = (value: string): string => {
  const numbers = value.replace(/\D/g, '');
  
  if (numbers.length <= 11) {
    // CPF format: 000.000.000-00
    return numbers
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  } else {
    // CNPJ format: 00.000.000/0000-00
    return numbers
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2')
      .replace(/(-\d{2})\d+?$/, '$1');
  }
};

export const validateProducerForm = (data: any): FormErrors => {
  const errors: FormErrors = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Nome é obrigatório';
  }
  
  if (!data.cpfCnpj?.trim()) {
    errors.cpfCnpj = 'CPF ou CNPJ é obrigatório';
  } else if (!validateCpfCnpj(data.cpfCnpj)) {
    errors.cpfCnpj = 'CPF ou CNPJ inválido';
  }
  
  return errors;
};

export const validateFarmForm = (data: any): FormErrors => {
  const errors: FormErrors = {};
  
  if (!data.name?.trim()) {
    errors.name = 'Nome da fazenda é obrigatório';
  }
  
  if (!data.city?.trim()) {
    errors.city = 'Cidade é obrigatória';
  }
  
  if (!data.state?.trim()) {
    errors.state = 'Estado é obrigatório';
  }
  
  if (!data.totalArea || data.totalArea <= 0) {
    errors.totalArea = 'Área total deve ser maior que zero';
  }
  
  if (!data.agriculturalArea || data.agriculturalArea < 0) {
    errors.agriculturalArea = 'Área agricultável deve ser maior ou igual a zero';
  }
  
  if (!data.vegetationArea || data.vegetationArea < 0) {
    errors.vegetationArea = 'Área de vegetação deve ser maior ou igual a zero';
  }
  
  if (data.totalArea && data.agriculturalArea && data.vegetationArea) {
    if (data.agriculturalArea + data.vegetationArea > data.totalArea) {
      errors.totalArea = 'A soma das áreas agricultável e vegetação não pode exceder a área total';
    }
  }
  
  return errors;
};

export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

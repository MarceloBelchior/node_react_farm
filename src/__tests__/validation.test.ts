import { validateCPF, validateCNPJ, validateCpfCnpj, formatCpfCnpj } from '../utils/validation';

describe('Validation Utils', () => {
  describe('validateCPF', () => {
    test('should validate correct CPF', () => {
      expect(validateCPF('123.456.789-09')).toBe(true);
      expect(validateCPF('12345678909')).toBe(true);
    });

    test('should reject incorrect CPF', () => {
      expect(validateCPF('123.456.789-00')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
      expect(validateCPF('123')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    test('should validate correct CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    test('should reject incorrect CNPJ', () => {
      expect(validateCNPJ('11.222.333/0001-00')).toBe(false);
      expect(validateCNPJ('11.111.111/1111-11')).toBe(false);
      expect(validateCNPJ('123')).toBe(false);
    });
  });

  describe('validateCpfCnpj', () => {
    test('should validate CPF and CNPJ', () => {
      expect(validateCpfCnpj('123.456.789-09')).toBe(true);
      expect(validateCpfCnpj('11.222.333/0001-81')).toBe(true);
    });

    test('should reject invalid formats', () => {
      expect(validateCpfCnpj('123')).toBe(false);
      expect(validateCpfCnpj('123.456.789-00')).toBe(false);
    });
  });

  describe('formatCpfCnpj', () => {
    test('should format CPF correctly', () => {
      expect(formatCpfCnpj('12345678909')).toBe('123.456.789-09');
    });

    test('should format CNPJ correctly', () => {
      expect(formatCpfCnpj('11222333000181')).toBe('11.222.333/0001-81');
    });

    test('should handle partial inputs', () => {
      expect(formatCpfCnpj('123')).toBe('123');
      expect(formatCpfCnpj('123456')).toBe('123.456');
    });
  });
});

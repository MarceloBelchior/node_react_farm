function validateCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  // Validate first verification digit
  if (parseInt(cpf[9]) !== digit1) return false;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  // Validate second verification digit
  if (parseInt(cpf[10]) !== digit2) return false;

  return true;
}

function calculateCPFDigits(baseDigits: string): string {
  if (baseDigits.length !== 9) throw new Error('Base digits must be 9 digits long');

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(baseDigits[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  const withFirstDigit = baseDigits + digit1;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(withFirstDigit[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  return withFirstDigit + digit2;
}

// Generate some valid CPFs
console.log('Generating valid CPFs...');
const baseNumbers = [
  '123456789',
  '987654321',
  '111111111',
  '222222222',
  '333333333'
];

for (const base of baseNumbers) {
  const cpf = calculateCPFDigits(base);
  console.log(`Base: ${base} -> CPF: ${cpf} -> Valid: ${validateCPF(cpf)}`);
}

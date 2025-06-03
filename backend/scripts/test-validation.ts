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

// Test CPF validation with known valid numbers
const testCPFs = [
  '72088706034',
  '83321250078',
  '94176508021'
];

console.log('Testing CPF validation:');
for (const cpf of testCPFs) {
  console.log(`CPF ${cpf} is ${validateCPF(cpf) ? 'valid' : 'invalid'}`);
}

function generateCPF(): string {
  // Let's use a base number and calculate valid check digits
  const base = '123456789';

  // Calculate first verification digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(base[i]) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;

  const withFirstDigit = base + digit1;

  // Calculate second verification digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(withFirstDigit[i]) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  return withFirstDigit + digit2;
}

function generateCNPJ(): string {
  // Let's use a base number and calculate valid check digits
  const base = '123456789012';

  // Calculate first verification digit
  let sum = 0;
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 12; i++) {
    sum += parseInt(base[i]) * weights1[i];
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 >= 10) digit1 = 0;

  const withFirstDigit = base + digit1;

  // Calculate second verification digit
  sum = 0;
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  for (let i = 0; i < 13; i++) {
    sum += parseInt(withFirstDigit[i]) * weights2[i];
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 >= 10) digit2 = 0;

  return withFirstDigit + digit2;
}

// Generate and print some valid documents
console.log('Generated CPF:', generateCPF());
console.log('Generated CNPJ:', generateCNPJ());

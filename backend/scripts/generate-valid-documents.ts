function generateCPF(): string {
  const numbers: number[] = [];

  // Generate first 9 digits
  for (let i = 0; i < 9; i++) {
    numbers.push(Math.floor(Math.random() * 10));
  }

  // Calculate first check digit
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += numbers[i] * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;
  numbers.push(digit1);

  // Calculate second check digit
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += numbers[i] * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;
  numbers.push(digit2);

  return numbers.join('');
}

function generateCNPJ(): string {
  const numbers: number[] = [];

  // Generate first 12 digits
  for (let i = 0; i < 12; i++) {
    numbers.push(Math.floor(Math.random() * 10));
  }

  // Calculate first check digit
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += numbers[i] * weights1[i];
  }
  let digit1 = sum % 11;
  digit1 = digit1 < 2 ? 0 : 11 - digit1;
  numbers.push(digit1);

  // Calculate second check digit
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += numbers[i] * weights2[i];
  }
  let digit2 = sum % 11;
  digit2 = digit2 < 2 ? 0 : 11 - digit2;
  numbers.push(digit2);

  return numbers.join('');
}

// Generate some valid CPFs and CNPJs
console.log('Valid CPFs:');
for (let i = 0; i < 3; i++) {
  console.log(generateCPF());
}

console.log('\nValid CNPJs:');
for (let i = 0; i < 3; i++) {
  console.log(generateCNPJ());
}

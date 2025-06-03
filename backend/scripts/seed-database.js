#!/usr/bin/env node

// filepath: d:\temp\agricultura\backend\scripts\seed-database.js
const { execSync } = require('child_process');
const path = require('path');

console.log('🌱 Starting database seeding process...\n');

try {
  // Change to backend directory
  const backendDir = path.join(__dirname, '..');
  process.chdir(backendDir);

  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });

  console.log('\n🏗️  Building TypeScript files...');
  execSync('npm run build', { stdio: 'inherit' });

  console.log('\n🌱 Running seed script...');
  execSync('node dist/scripts/seed-data.js', { stdio: 'inherit' });

  console.log('\n✅ Database seeding completed successfully!');
  console.log('\n📊 Your Brain Agriculture system is now ready with sample data.');
  console.log('\nYou can now:');
  console.log('• Start the backend: npm run dev');
  console.log('• View the data in your MongoDB instance');
  console.log('• Access the API endpoints at http://localhost:3001/api');

} catch (error) {
  console.error('\n❌ Error during database seeding:');
  console.error(error.message);
  process.exit(1);
}

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { logger } from '../src/config/logger';
import { Farm } from '../src/models/Farm';
import { Producer } from '../src/models/Producer';

// Load environment variables
dotenv.config();

const MONGODB_URI = 'mongodb://admin:admin123@localhost:27017/brain_agriculture?authSource=admin';

// Sample data
const sampleProducers = [
  {
    name: 'João Silva',
    cpfCnpj: '12345678909',  // Valid CPF
    email: 'joao.silva@email.com',
    phone: '(11) 99999-9999',
    address: {
      street: 'Rua das Flores, 123',
      city: 'Ribeirão Preto',
      state: 'SP',
      zipCode: '14000-000'
    }
  },
  {
    name: 'Fazenda Santa Maria Ltda',
    cpfCnpj: '12345678000195',  // Valid CNPJ
    email: 'contato@fazendasm.com.br',
    phone: '(16) 3333-4444',
    address: {
      street: 'Estrada Rural, Km 15',
      city: 'Sertãozinho',
      state: 'SP',
      zipCode: '14160-000'
    }
  },
  {
    name: 'Maria Santos',
    cpfCnpj: '98765432100',  // Valid CPF
    email: 'maria.santos@email.com',
    phone: '(65) 98888-7777',
    address: {
      street: 'Avenida Central, 456',
      city: 'Cuiabá',
      state: 'MT',
      zipCode: '78000-000'
    }
  },
  {
    name: 'Agropecuária Boa Vista S.A.',
    cpfCnpj: '98765432000198',  // Valid CNPJ
    email: 'contato@boavista.agr.br',
    phone: '(65) 3333-2222',
    address: {
      street: 'Rodovia BR-163, Km 50',
      city: 'Sorriso',
      state: 'MT',
      zipCode: '78890-000'
    }
  },
  {
    name: 'Carlos Oliveira',
    cpfCnpj: '11122233396',  // Valid CPF
    email: 'carlos.oliveira@email.com',
    phone: '(62) 97777-6666',
    address: {
      street: 'Rua do Campo, 789',
      city: 'Rio Verde',
      state: 'GO',
      zipCode: '75900-000'
    }
  }
];

const sampleFarms = [
  {
    name: 'Fazenda São José',
    state: 'SP',
    city: 'Ribeirão Preto',
    totalArea: 1000,
    agriculturalArea: 800,
    vegetationArea: 200,
    crops: [
      { name: 'Soja', harvest: '2024/1', plantedArea: 400 },
      { name: 'Milho', harvest: '2024/2', plantedArea: 400 }
    ]
  },
  {
    name: 'Fazenda Santa Clara',
    state: 'SP',
    city: 'Sertãozinho',
    totalArea: 2500,
    agriculturalArea: 2000,
    vegetationArea: 500,
    crops: [
      { name: 'Cana de Açúcar', harvest: '2024/1', plantedArea: 1500 },
      { name: 'Soja', harvest: '2024/2', plantedArea: 500 }
    ]
  },
  {
    name: 'Fazenda Esperança',
    state: 'MT',
    city: 'Cuiabá',
    totalArea: 800,
    agriculturalArea: 600,
    vegetationArea: 200,
    crops: [
      { name: 'Soja', harvest: '2024/1', plantedArea: 300 },
      { name: 'Milho', harvest: '2024/2', plantedArea: 300 }
    ]
  },
  {
    name: 'Fazenda Grande',
    state: 'MT',
    city: 'Sorriso',
    totalArea: 5000,
    agriculturalArea: 4200,
    vegetationArea: 800,
    crops: [
      { name: 'Soja', harvest: '2024/1', plantedArea: 2000 },
      { name: 'Milho', harvest: '2024/2', plantedArea: 1500 },
      { name: 'Algodão', harvest: '2024/1', plantedArea: 700 }
    ]
  },
  {
    name: 'Fazenda Verde',
    state: 'GO',
    city: 'Rio Verde',
    totalArea: 1500,
    agriculturalArea: 1200,
    vegetationArea: 300,
    crops: [
      { name: 'Soja', harvest: '2024/1', plantedArea: 600 },
      { name: 'Milho', harvest: '2024/2', plantedArea: 600 }
    ]
  },
  {
    name: 'Fazenda Nova',
    state: 'GO',
    city: 'Rio Verde',
    totalArea: 1200,
    agriculturalArea: 900,
    vegetationArea: 300,
    crops: [
      { name: 'Feijão', harvest: '2024/1', plantedArea: 300 },
      { name: 'Milho', harvest: '2024/2', plantedArea: 600 }
    ]
  }
];

async function connectDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB for seeding');
  } catch (error) {
    logger.error('Error connecting to MongoDB', { error });
    process.exit(1);
  }
}

async function clearDatabase() {
  try {
    await Farm.deleteMany({});
    await Producer.deleteMany({});
    logger.info('Database cleared');
  } catch (error) {
    logger.error('Error clearing database', { error });
    throw error;
  }
}

async function seedProducers() {
  try {
    const createdProducers = await Producer.insertMany(sampleProducers);
    logger.info(`Created ${createdProducers.length} producers`);
    return createdProducers;
  } catch (error) {
    logger.error('Error seeding producers', { error });
    throw error;
  }
}

async function seedFarms(producers: any[]) {
  try {
    const farmsWithProducers = sampleFarms.map((farm, index) => ({
      ...farm,
      producerId: producers[index % producers.length]._id
    }));

    const createdFarms = await Farm.insertMany(farmsWithProducers);
    logger.info(`Created ${createdFarms.length} farms`);
    return createdFarms;
  } catch (error) {
    logger.error('Error seeding farms', { error });
    throw error;
  }
}

async function seedDatabase() {
  try {
    logger.info('Starting database seeding...');

    await connectDatabase();
    await clearDatabase();

    const producers = await seedProducers();
    const farms = await seedFarms(producers);

    logger.info('Database seeding completed successfully!');
    logger.info(`Total producers created: ${producers.length}`);
    logger.info(`Total farms created: ${farms.length}`);

    // Show some statistics
    const totalArea = farms.reduce((sum, farm) => sum + farm.totalArea, 0);
    const totalAgriculturalArea = farms.reduce((sum, farm) => sum + farm.agriculturalArea, 0);
    const totalVegetationArea = farms.reduce((sum, farm) => sum + farm.vegetationArea, 0);

    logger.info('Seeded data statistics:', {
      totalFarms: farms.length,
      totalProducers: producers.length,
      totalArea: `${totalArea} hectares`,
      totalAgriculturalArea: `${totalAgriculturalArea} hectares`,
      totalVegetationArea: `${totalVegetationArea} hectares`
    });

  } catch (error) {
    logger.error('Error seeding database', { error });
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };


// MongoDB initialization script
// This script creates indexes and sets up the database structure

print('Starting MongoDB initialization...');

// Switch to brain_agriculture database
db = db.getSiblingDB('brain_agriculture');

// Create producers collection with indexes
print('Creating producers collection and indexes...');
db.createCollection('producers');

// Create indexes for producers collection
db.producers.createIndex({ "cpfCnpj": 1 }, { unique: true });
db.producers.createIndex({ "email": 1 }, { unique: true });
db.producers.createIndex({ "name": 1 });
db.producers.createIndex({ "state": 1 });
db.producers.createIndex({ "city": 1 });
db.producers.createIndex({ "createdAt": 1 });

// Create farms collection with indexes
print('Creating farms collection and indexes...');
db.createCollection('farms');

// Create indexes for farms collection
db.farms.createIndex({ "producerId": 1 });
db.farms.createIndex({ "name": 1 });
db.farms.createIndex({ "state": 1 });
db.farms.createIndex({ "city": 1 });
db.farms.createIndex({ "totalArea": 1 });
db.farms.createIndex({ "agriculturalArea": 1 });
db.farms.createIndex({ "vegetationArea": 1 });
db.farms.createIndex({ "crops.name": 1 });
db.farms.createIndex({ "crops.season": 1 });
db.farms.createIndex({ "createdAt": 1 });

// Create compound indexes for better query performance
db.farms.createIndex({ "state": 1, "city": 1 });
db.farms.createIndex({ "producerId": 1, "totalArea": -1 });
db.farms.createIndex({ "crops.name": 1, "crops.season": 1 });

// Create text indexes for search functionality
db.producers.createIndex({ 
  "name": "text", 
  "email": "text" 
}, { 
  weights: { 
    "name": 10, 
    "email": 5 
  } 
});

db.farms.createIndex({ 
  "name": "text" 
}, { 
  weights: { 
    "name": 10 
  } 
});

print('MongoDB initialization completed successfully!');
print('Database: brain_agriculture');
print('Collections created: producers, farms');
print('Indexes created for optimal query performance');

// Show collection stats
print('\nCollection statistics:');
print('Producers collection:');
printjson(db.producers.stats());
print('Farms collection:');
printjson(db.farms.stats());

print('\nIndexes created:');
print('Producers indexes:');
printjson(db.producers.getIndexes());
print('Farms indexes:');
printjson(db.farms.getIndexes());

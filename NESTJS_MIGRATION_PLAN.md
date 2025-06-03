# NestJS Migration Plan

## Current Express.js Structure → NestJS Structure

### 1. Dependencies Changes
```json
// Remove Express-specific packages
- express
- express-rate-limit
- swagger-jsdoc
- swagger-ui-express

// Add NestJS packages
+ @nestjs/common
+ @nestjs/core
+ @nestjs/platform-express
+ @nestjs/mongoose
+ @nestjs/swagger
+ @nestjs/config
+ @nestjs/throttler
+ class-validator
+ class-transformer
```

### 2. File Structure Migration

#### Current Express Structure:
```
backend/src/
├── server.ts                    → main.ts
├── config/
│   ├── database.ts             → app.module.ts (imports)
│   ├── logger.ts               → logger.module.ts
│   └── swagger.ts              → main.ts (setup)
├── controllers/
│   ├── producer.controller.ts   → producer.controller.ts (with decorators)
│   ├── farm.controller.ts       → farm.controller.ts (with decorators)
│   ├── dashboard.controller.ts  → dashboard.controller.ts (with decorators)
│   └── health.controller.ts     → health.controller.ts (with decorators)
├── models/
│   ├── Producer.ts             → producer.schema.ts
│   └── Farm.ts                 → farm.schema.ts
├── routes/                     → (removed - handled by controllers)
├── middleware/
│   ├── errorHandler.ts         → exception.filter.ts
│   ├── validation.ts           → validation.pipe.ts
│   └── notFoundHandler.ts      → (built-in 404 handling)
└── types/
    └── index.ts                → dto/ folder
```

#### New NestJS Structure:
```
backend/src/
├── main.ts
├── app.module.ts
├── modules/
│   ├── producer/
│   │   ├── producer.module.ts
│   │   ├── producer.controller.ts
│   │   ├── producer.service.ts
│   │   ├── producer.schema.ts
│   │   └── dto/
│   │       ├── create-producer.dto.ts
│   │       └── update-producer.dto.ts
│   ├── farm/
│   │   ├── farm.module.ts
│   │   ├── farm.controller.ts
│   │   ├── farm.service.ts
│   │   ├── farm.schema.ts
│   │   └── dto/
│   ├── dashboard/
│   │   ├── dashboard.module.ts
│   │   ├── dashboard.controller.ts
│   │   └── dashboard.service.ts
│   └── health/
│       ├── health.module.ts
│       └── health.controller.ts
├── common/
│   ├── filters/
│   │   └── exception.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   ├── guards/
│   └── interceptors/
└── config/
    └── database.config.ts
```

## 3. Code Examples

### Current Express Controller:
```typescript
// Current: backend/src/controllers/producer.controller.ts
export const getProducers = async (req: Request, res: Response) => {
  try {
    const producers = await Producer.find();
    res.json({ success: true, data: producers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
```

### NestJS Controller:
```typescript
// New: src/modules/producer/producer.controller.ts
@Controller('producers')
@ApiTags('producers')
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Get()
  @ApiOperation({ summary: 'Get all producers' })
  @ApiResponse({ status: 200, description: 'List of producers', type: [ProducerDto] })
  async findAll(): Promise<Producer[]> {
    return this.producerService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new producer' })
  @ApiResponse({ status: 201, description: 'Producer created successfully' })
  async create(@Body() createProducerDto: CreateProducerDto): Promise<Producer> {
    return this.producerService.create(createProducerDto);
  }
}
```

### NestJS Service:
```typescript
// New: src/modules/producer/producer.service.ts
@Injectable()
export class ProducerService {
  constructor(
    @InjectModel(Producer.name) private producerModel: Model<Producer>
  ) {}

  async findAll(): Promise<Producer[]> {
    return this.producerModel.find().exec();
  }

  async create(createProducerDto: CreateProducerDto): Promise<Producer> {
    const createdProducer = new this.producerModel(createProducerDto);
    return createdProducer.save();
  }
}
```

### NestJS Schema:
```typescript
// New: src/modules/producer/producer.schema.ts
@Schema({ timestamps: true })
export class Producer {
  @Prop({ required: true })
  @ApiProperty({ description: 'Producer name' })
  name: string;

  @Prop({ required: true, unique: true })
  @ApiProperty({ description: 'Producer document (CPF/CNPJ)' })
  document: string;

  @Prop({ required: true })
  @ApiProperty({ description: 'Farm name' })
  farmName: string;
}

export const ProducerSchema = SchemaFactory.createForClass(Producer);
```

## 4. Migration Steps

### Phase 1: Setup NestJS
1. Install NestJS dependencies
2. Create basic module structure
3. Setup main.ts and app.module.ts

### Phase 2: Migrate Core Features
1. Convert models to schemas
2. Create DTOs for validation
3. Convert controllers (one by one)
4. Create services
5. Setup modules

### Phase 3: Advanced Features
1. Add authentication guards
2. Setup proper exception filters
3. Configure Swagger
4. Add rate limiting
5. Setup logging

### Phase 4: Testing & Cleanup
1. Update tests for NestJS
2. Remove old Express files
3. Update Docker configuration
4. Update documentation

## 5. Benefits After Migration

✅ **Better Code Organization:** Modular structure with clear separation
✅ **Automatic Swagger:** No manual JSDoc comments needed
✅ **Built-in Validation:** Class-validator with DTOs
✅ **Dependency Injection:** Cleaner, testable code
✅ **Better Error Handling:** Built-in exception filters
✅ **Enhanced Security:** Guards, interceptors, and pipes
✅ **Improved Testing:** Built-in testing utilities

## 6. Migration Timeline
- **Small project (current size):** 1-2 weeks
- **Minimal risk:** Can be done incrementally
- **High reward:** Much better maintainability and scalability

import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  Query, 
  HttpStatus, 
  HttpCode,
  UseGuards
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam, 
  ApiQuery 
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { FarmService } from './farm.service';
import { CreateFarmDto, UpdateFarmDto } from './dto';
import { Farm } from './farm.schema';

@ApiTags('farms')
@Controller('farms')
@UseGuards(ThrottlerGuard)
export class FarmController {
  constructor(private readonly farmService: FarmService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new farm',
    description: 'Creates a new farm for a producer with area validation',
  })
  @ApiResponse({
    status: 201,
    description: 'Farm created successfully',
    type: Farm,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid input data or area calculations',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Farm with this name already exists for the producer',
  })
  async create(@Body() createFarmDto: CreateFarmDto): Promise<Farm> {
    return this.farmService.create(createFarmDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all farms',
    description: 'Retrieves a paginated list of all farms with optional filters',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10, max: 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search term for farm name, city, or state',
    example: 'São João',
  })
  @ApiQuery({
    name: 'producerId',
    required: false,
    type: String,
    description: 'Filter by producer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    type: String,
    description: 'Filter by state (2-letter code)',
    example: 'SP',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filter by city',
    example: 'Ribeirão Preto',
  })
  @ApiResponse({
    status: 200,
    description: 'List of farms retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Farm' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
        hasNextPage: { type: 'boolean', example: true },
        hasPrevPage: { type: 'boolean', example: false },
      },
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('producerId') producerId?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
  ) {
    const pageNum = page && page > 0 ? page : 1;
    const limitNum = limit && limit > 0 && limit <= 100 ? limit : 10;
    
    return this.farmService.findAll(pageNum, limitNum, search, producerId, state, city);
  }

  @Get('statistics/by-state')
  @ApiOperation({
    summary: 'Get farms statistics by state',
    description: 'Returns farm count and total area grouped by state',
  })
  @ApiResponse({
    status: 200,
    description: 'Statistics by state retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          state: { type: 'string', example: 'SP' },
          count: { type: 'number', example: 15 },
          totalArea: { type: 'number', example: 25000.5 },
        },
      },
    },
  })
  async getByState() {
    return this.farmService.getByState();
  }

  @Get('statistics/crops')
  @ApiOperation({
    summary: 'Get crop statistics',
    description: 'Returns statistics about crops planted across all farms',
  })
  @ApiResponse({
    status: 200,
    description: 'Crop statistics retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          crop: { type: 'string', example: 'Soja' },
          count: { type: 'number', example: 25 },
          totalArea: { type: 'number', example: 15000.0 },
        },
      },
    },
  })
  async getCropStatistics() {
    return this.farmService.getCropStatistics();
  }

  @Get('statistics/areas')
  @ApiOperation({
    summary: 'Get overall area statistics',
    description: 'Returns total and average area statistics for all farms',
  })
  @ApiResponse({
    status: 200,
    description: 'Area statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalFarms: { type: 'number', example: 100 },
        totalArea: { type: 'number', example: 150000.5 },
        totalAgriculturalArea: { type: 'number', example: 100000.0 },
        totalVegetationArea: { type: 'number', example: 45000.0 },
        averageFarmSize: { type: 'number', example: 1500.005 },
      },
    },
  })
  async getAreaStatistics() {
    return this.farmService.getAreaStatistics();
  }

  @Get('producer/:producerId')
  @ApiOperation({
    summary: 'Get farms by producer',
    description: 'Retrieves all farms belonging to a specific producer',
  })
  @ApiParam({
    name: 'producerId',
    type: String,
    description: 'Producer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Producer farms retrieved successfully',
    type: [Farm],
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid producer ID format',
  })
  async findByProducer(@Param('producerId') producerId: string): Promise<Farm[]> {
    return this.farmService.findByProducer(producerId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get farm by ID',
    description: 'Retrieves a specific farm by its ID with producer information',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Farm ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Farm found successfully',
    type: Farm,
  })
  @ApiResponse({
    status: 404,
    description: 'Farm not found',
  })
  async findOne(@Param('id') id: string): Promise<Farm> {
    return this.farmService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update farm',
    description: 'Updates an existing farm by ID with area validation',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Farm ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Farm updated successfully',
    type: Farm,
  })
  @ApiResponse({
    status: 404,
    description: 'Farm not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Farm with this name already exists for the producer',
  })
  async update(
    @Param('id') id: string,
    @Body() updateFarmDto: UpdateFarmDto,
  ): Promise<Farm> {
    return this.farmService.update(id, updateFarmDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete farm',
    description: 'Deletes a farm by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Farm ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Farm deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Farm not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.farmService.remove(id);
  }
}

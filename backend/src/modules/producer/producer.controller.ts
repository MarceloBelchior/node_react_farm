import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ProducerService } from './producer.service';
import { CreateProducerDto, UpdateProducerDto } from './dto';
import { Producer } from './producer.schema';

@ApiTags('producers')
@Controller('producers')
@UseGuards(ThrottlerGuard)
export class ProducerController {
  constructor(private readonly producerService: ProducerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new producer',
    description: 'Creates a new rural producer with unique CPF/CNPJ validation',
  })
  @ApiResponse({
    status: 201,
    description: 'Producer created successfully',
    type: Producer,
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error - Invalid input data',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'array', items: { type: 'string' } },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Producer with this CPF/CNPJ already exists',
  })
  async create(@Body() createProducerDto: CreateProducerDto): Promise<Producer> {
    return this.producerService.create(createProducerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all producers',
    description: 'Retrieves a paginated list of all producers with optional search',
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
    description: 'Search term for name or CPF/CNPJ',
    example: 'João',
  })
  @ApiResponse({
    status: 200,
    description: 'List of producers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/Producer' },
        },
        total: { type: 'number', example: 50 },
        page: { type: 'number', example: 1 },
        totalPages: { type: 'number', example: 5 },
      },
    },
  })
  async findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
  ) {
    const pageNum = page && page > 0 ? page : 1;
    const limitNum = limit && limit > 0 && limit <= 100 ? limit : 10;
    
    return this.producerService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get producer by ID',
    description: 'Retrieves a specific producer by their ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Producer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Producer found successfully',
    type: Producer,
  })
  @ApiResponse({
    status: 404,
    description: 'Producer not found',
  })
  async findOne(@Param('id') id: string): Promise<Producer> {
    return this.producerService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update producer',
    description: 'Updates an existing producer by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Producer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 200,
    description: 'Producer updated successfully',
    type: Producer,
  })
  @ApiResponse({
    status: 404,
    description: 'Producer not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - Producer with this CPF/CNPJ already exists',
  })
  async update(
    @Param('id') id: string,
    @Body() updateProducerDto: UpdateProducerDto,
  ): Promise<Producer> {
    return this.producerService.update(id, updateProducerDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete producer',
    description: 'Deletes a producer by ID',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Producer ID',
    example: '507f1f77bcf86cd799439011',
  })
  @ApiResponse({
    status: 204,
    description: 'Producer deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Producer not found',
  })
  async remove(@Param('id') id: string): Promise<void> {
    return this.producerService.remove(id);
  }

  @Get('validate/cpf-cnpj/:cpfCnpj')
  @ApiOperation({
    summary: 'Validate CPF/CNPJ uniqueness',
    description: 'Checks if a CPF/CNPJ is available for use',
  })
  @ApiParam({
    name: 'cpfCnpj',
    type: String,
    description: 'CPF or CNPJ to validate',
    example: '12345678901',
  })
  @ApiQuery({
    name: 'excludeId',
    required: false,
    type: String,
    description: 'Producer ID to exclude from validation (for updates)',
  })
  @ApiResponse({
    status: 200,
    description: 'Validation result',
    schema: {
      type: 'object',
      properties: {
        available: { type: 'boolean', example: true },
        message: { type: 'string', example: 'CPF/CNPJ disponível' },
      },
    },
  })
  async validateCpfCnpj(
    @Param('cpfCnpj') cpfCnpj: string,
    @Query('excludeId') excludeId?: string,
  ) {
    const isAvailable = await this.producerService.validateCpfCnpjUnique(
      cpfCnpj,
      excludeId,
    );
    
    return {
      available: isAvailable,
      message: isAvailable ? 'CPF/CNPJ disponível' : 'CPF/CNPJ já está em uso',
    };
  }
}
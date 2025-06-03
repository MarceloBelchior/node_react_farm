import { Controller, Get, UseGuards } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse 
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { DashboardService, DashboardStats } from './dashboard.service';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(ThrottlerGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({
    summary: 'Get dashboard statistics',
    description: 'Retrieves comprehensive statistics for the dashboard including farms, producers, areas, and crops',
  })
  @ApiResponse({
    status: 200,
    description: 'Dashboard statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalProducers: { type: 'number', example: 150 },
        totalFarms: { type: 'number', example: 300 },
        totalArea: { type: 'number', example: 500000.5 },
        totalAgriculturalArea: { type: 'number', example: 350000.0 },
        totalVegetationArea: { type: 'number', example: 120000.0 },
        averageFarmSize: { type: 'number', example: 1666.67 },
        farmsByState: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              state: { type: 'string', example: 'SP' },
              count: { type: 'number', example: 45 },
              totalArea: { type: 'number', example: 150000.0 },
            },
          },
        },
        cropStatistics: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              crop: { type: 'string', example: 'Soja' },
              count: { type: 'number', example: 85 },
              totalArea: { type: 'number', example: 120000.0 },
              percentage: { type: 'number', example: 34.3 },
            },
          },
        },
        landUseDistribution: {
          type: 'object',
          properties: {
            agricultural: {
              type: 'object',
              properties: {
                area: { type: 'number', example: 350000.0 },
                percentage: { type: 'number', example: 70.0 },
              },
            },
            vegetation: {
              type: 'object',
              properties: {
                area: { type: 'number', example: 120000.0 },
                percentage: { type: 'number', example: 24.0 },
              },
            },
            unused: {
              type: 'object',
              properties: {
                area: { type: 'number', example: 30000.5 },
                percentage: { type: 'number', example: 6.0 },
              },
            },
          },
        },
        topStates: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              state: { type: 'string', example: 'SP' },
              farmCount: { type: 'number', example: 45 },
              totalArea: { type: 'number', example: 150000.0 },
              averageSize: { type: 'number', example: 3333.33 },
            },
          },
        },
        recentActivity: {
          type: 'object',
          properties: {
            newProducersLastMonth: { type: 'number', example: 8 },
            newFarmsLastMonth: { type: 'number', example: 15 },
            totalGrowthPercentage: { type: 'number', example: 5.1 },
          },
        },
      },
    },
  })
  async getDashboardStats(): Promise<DashboardStats> {
    return this.dashboardService.getDashboardStats();
  }

  @Get('producers-by-state')
  @ApiOperation({
    summary: 'Get producers distribution by state',
    description: 'Returns the number of producers grouped by state',
  })
  @ApiResponse({
    status: 200,
    description: 'Producers by state retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          state: { type: 'string', example: 'SP' },
          count: { type: 'number', example: 25 },
        },
      },
    },
  })
  async getProducersByState() {
    return this.dashboardService.getProducersByState();
  }

  @Get('farm-size-distribution')
  @ApiOperation({
    summary: 'Get farm size distribution',
    description: 'Returns farms grouped by size ranges',
  })
  @ApiResponse({
    status: 200,
    description: 'Farm size distribution retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          range: { type: 'string', example: '100-500 ha' },
          count: { type: 'number', example: 45 },
          averageArea: { type: 'number', example: 300.5 },
        },
      },
    },
  })
  async getFarmSizeDistribution() {
    return this.dashboardService.getFarmSizeDistribution();
  }

  @Get('monthly-growth')
  @ApiOperation({
    summary: 'Get monthly growth statistics',
    description: 'Returns monthly growth data for producers and farms over the last 6 months',
  })
  @ApiResponse({
    status: 200,
    description: 'Monthly growth data retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          month: { type: 'string', example: '2024-01' },
          producers: { type: 'number', example: 12 },
          farms: { type: 'number', example: 25 },
        },
      },
    },
  })
  async getMonthlyGrowth() {
    return this.dashboardService.getMonthlyGrowth();
  }
}

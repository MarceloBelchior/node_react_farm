import { Controller, Get } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse 
} from '@nestjs/swagger';
import { 
  HealthCheckService, 
  HealthCheck, 
  MongooseHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator
} from '@nestjs/terminus';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mongoose: MongooseHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Returns the overall health status of the application',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            memory_heap: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            memory_rss: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            storage: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: { type: 'object' },
        details: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            memory_heap: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            memory_rss: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            storage: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed',
  })  @HealthCheck()
  async check() {
    const checks = [
      // Database connectivity check
      () => this.mongoose.pingCheck('database'),
      
      // Memory usage checks
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024), // 150MB heap limit
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),   // 300MB RSS limit
    ];

    // Add disk check only for non-Windows systems or with Windows-compatible path
    if (process.platform !== 'win32') {
      checks.push(() => this.disk.checkStorage('storage', { 
        path: '/', 
        thresholdPercent: 0.9 // Alert if disk usage > 90%
      }));
    } else {
      // For Windows, check C: drive
      checks.push(() => this.disk.checkStorage('storage', { 
        path: 'C:\\', 
        thresholdPercent: 0.9 // Alert if disk usage > 90%
      }));
    }

    return this.health.check(checks);
  }

  @Get('simple')
  @ApiOperation({
    summary: 'Simple health check',
    description: 'Returns a simple health status without detailed checks',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is running',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ok' },
        timestamp: { type: 'string', example: '2024-01-15T10:30:00.000Z' },
        uptime: { type: 'number', example: 3600 },
        environment: { type: 'string', example: 'development' },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  async simpleCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('readiness')
  @ApiOperation({
    summary: 'Readiness probe',
    description: 'Checks if the application is ready to serve traffic (used by Kubernetes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready',
  })
  @HealthCheck()
  async readiness() {
    return this.health.check([
      () => this.mongoose.pingCheck('database'),
    ]);
  }

  @Get('liveness')
  @ApiOperation({
    summary: 'Liveness probe',
    description: 'Checks if the application is alive (used by Kubernetes)',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  async liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}

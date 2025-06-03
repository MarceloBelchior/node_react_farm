import { LogLevel, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { logger } from './config/logger';
import { DebugUtils } from './utils/debug';
import { MongoDebugUtils } from './utils/mongo-debug';

async function bootstrap() {
  // Enable detailed logging for debugging
  const logLevel: LogLevel[] = process.env.NODE_ENV === 'development'
    ? ['error', 'warn', 'log', 'debug', 'verbose']
    : ['error', 'warn', 'log'];

  const app = await NestFactory.create(AppModule, {
    logger: logLevel,
  });
  // Log memory usage at startup
  DebugUtils.logMemoryUsage('Application Startup');

  // Setup MongoDB debugging
  if (process.env.NODE_ENV === 'development') {
    MongoDebugUtils.enableMongooseDebug();
    MongoDebugUtils.setupConnectionLogging();
  }

  const configService = app.get(ConfigService);

  // Debug environment variables
  if (process.env.NODE_ENV === 'development') {
    logger.debug('🔧 Environment Variables:', {
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
      MONGODB_URI: process.env.MONGODB_URI ? 'Set' : 'Not Set',
      CORS_ORIGIN: process.env.CORS_ORIGIN,
      DEBUG_HEADERS: process.env.DEBUG_HEADERS || 'false',
      DEBUG_RESPONSE: process.env.DEBUG_RESPONSE || 'false',
      DEBUG_STACK: process.env.DEBUG_STACK || 'false',
    });
  }

  // Security middleware
  app.use(helmet());
  app.use(compression());

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Brain Agriculture API')
    .setDescription('Rural Producer Management System - A comprehensive API for managing agricultural producers, farms, and crops')
    .setVersion('1.0.0')
    .setContact(
      'Brain Agriculture Team',
      'https://github.com/marcelobelchior/agriculture',
      'marcelo.belchior@gmail.com'
    )
    .setLicense('MIT', 'https://opensource.org/licenses/MIT')
    .addServer('http://localhost:3001', 'Development Server')
    .addServer('https://api.brain-agriculture.com', 'Production Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('producers', 'Rural producer management operations')
    .addTag('farms', 'Farm and crop management operations')
    .addTag('dashboard', 'Analytics and dashboard statistics')
    .addTag('health', 'System health and monitoring')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
    customCss: `
      .swagger-ui .topbar { display: none }
      .swagger-ui .info .title { color: #2e7d32; }
      .swagger-ui .scheme-container { background: #f5f5f5; padding: 15px; }
    `,
    customSiteTitle: 'Brain Agriculture API Documentation',
  });
  // API info endpoint
  app.getHttpAdapter().get('/api', (_req, res) => {
    res.json({
      success: true,
      message: 'Brain Agriculture API',
      version: '1.0.0',
      documentation: '/api-docs',
      endpoints: {
        producers: '/api/producers',
        farms: '/api/farms',
        dashboard: '/api/dashboard',
        health: '/api/health',
      },
    });
  });

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  logger.info(`🚀 Brain Agriculture API running on: http://localhost:${port}`);
  logger.info(`📚 Swagger documentation: http://localhost:${port}/api-docs`);
  logger.info(`🔍 API info: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
  logger.error('❌ Failed to start application:', error);
  process.exit(1);
});

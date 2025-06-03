import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerModule } from '@nestjs/throttler';
import { DebugInterceptor } from './interceptors/debug.interceptor';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { FarmModule } from './modules/farm/farm.module';
import { HealthModule } from './modules/health/health.module';
import { ProducerModule } from './modules/producer/producer.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),    // Database
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/brain_agriculture?authSource=admin',
        retryWrites: true,
        w: 'majority',
      }),
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minute
        limit: 100, // 100 requests per minute
      },
    ]),

    // Health checks
    TerminusModule,

    // Feature modules
    ProducerModule,
    FarmModule,
    DashboardModule,
    HealthModule,
  ],
  providers: [
    // Global debug interceptor for development
    {
      provide: APP_INTERCEPTOR,
      useClass: DebugInterceptor,
    },
  ],
})
export class AppModule { }

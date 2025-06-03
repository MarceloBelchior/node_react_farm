import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Producer, ProducerSchema } from '../producer/producer.schema';
import { Farm, FarmSchema } from '../farm/farm.schema';
import { DashboardService } from './dashboard.service';
import { DashboardController } from './dashboard.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Producer.name, schema: ProducerSchema },
      { name: Farm.name, schema: FarmSchema }
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Producer, ProducerSchema } from './producer.schema';
import { ProducerService } from './producer.service';
import { ProducerController } from './producer.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Producer.name, schema: ProducerSchema }
    ])
  ],
  controllers: [ProducerController],
  providers: [ProducerService],
  exports: [ProducerService],
})
export class ProducerModule {}
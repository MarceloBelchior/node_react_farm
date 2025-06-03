import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MongoDebugUtils } from '../../utils/mongo-debug';
import { CreateProducerDto, UpdateProducerDto } from './dto';
import { Producer, ProducerDocument } from './producer.schema';

@Injectable()
export class ProducerService {
  constructor(
    @InjectModel(Producer.name) private producerModel: Model<ProducerDocument>,
  ) { }

  @MongoDebugUtils.createServiceDebugDecorator('ProducerService')
  async create(createProducerDto: CreateProducerDto): Promise<Producer> {
    try {
      const createdProducer = new this.producerModel(createProducerDto); return await createdProducer.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Produtor com este CPF/CNPJ já existe');
      }
      throw error;
    }
  }
  @MongoDebugUtils.createServiceDebugDecorator('ProducerService')
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{
    data: Producer[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const query = search
      ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { cpfCnpj: { $regex: search, $options: 'i' } },
        ],
      }
      : {};

    const [data, total] = await Promise.all([
      this.producerModel.find(query).skip(skip).limit(limit).exec(),
      this.producerModel.countDocuments(query).exec(),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Producer> {
    const producer = await this.producerModel.findById(id).exec();
    if (!producer) {
      throw new NotFoundException('Produtor não encontrado');
    }
    return producer;
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<Producer | null> {
    return this.producerModel.findOne({ cpfCnpj }).exec();
  }

  async update(id: string, updateProducerDto: UpdateProducerDto): Promise<Producer> {
    try {
      const updatedProducer = await this.producerModel
        .findByIdAndUpdate(id, updateProducerDto, { new: true })
        .exec();

      if (!updatedProducer) {
        throw new NotFoundException('Produtor não encontrado');
      }
      return updatedProducer;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictException('Produtor com este CPF/CNPJ já existe');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const result = await this.producerModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Produtor não encontrado');
    }
  }

  async count(): Promise<number> {
    return this.producerModel.countDocuments().exec();
  }

  async validateCpfCnpjUnique(cpfCnpj: string, excludeId?: string): Promise<boolean> {
    const query: any = { cpfCnpj };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await this.producerModel.findOne(query).exec();
    return !existing;
  }
}

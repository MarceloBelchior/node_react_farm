import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { MongoDebugUtils } from '../../utils/mongo-debug';
import { CreateFarmDto, UpdateFarmDto } from './dto';
import { Farm, FarmDocument } from './farm.schema';

@Injectable()
export class FarmService {
  constructor(
    @InjectModel(Farm.name) private farmModel: Model<FarmDocument>,
  ) { }

  @MongoDebugUtils.createServiceDebugDecorator('FarmService')
  async create(createFarmDto: CreateFarmDto): Promise<Farm> {
    try {
      // Validate producer exists (this would typically be done with a ProducerService dependency)
      if (!Types.ObjectId.isValid(createFarmDto.producerId)) {
        throw new BadRequestException('Invalid producer ID');
      }

      // Check if farm name already exists for this producer
      const existingFarm = await this.farmModel.findOne({
        producerId: createFarmDto.producerId,
        name: createFarmDto.name,
      });

      if (existingFarm) {
        throw new ConflictException('A farm with this name already exists for this producer');
      }

      // Validate area calculations
      const totalUsed = createFarmDto.agriculturalArea + createFarmDto.vegetationArea;
      if (totalUsed > createFarmDto.totalArea) {
        throw new BadRequestException('Agricultural area + vegetation area cannot exceed total area');
      }

      const createdFarm = new this.farmModel(createFarmDto);
      return await createdFarm.save();
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to create farm');
    }
  }
  @MongoDebugUtils.createServiceDebugDecorator('FarmService')
  async findAll(
    page: number = 1,
    limit: number = 10,
    search?: string,
    producerId?: string,
    state?: string,
    city?: string,
  ) {
    const skip = (page - 1) * limit;
    const query: any = {};

    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { state: { $regex: search, $options: 'i' } },
      ];
    }

    // Add filters
    if (producerId) {
      if (!Types.ObjectId.isValid(producerId)) {
        throw new BadRequestException('Invalid producer ID');
      }
      query.producerId = producerId;
    }

    if (state) {
      query.state = state.toUpperCase();
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    const [data, total] = await Promise.all([
      this.farmModel
        .find(query)
        .populate('producerId', 'name cpfCnpj')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.farmModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  async findOne(id: string): Promise<Farm> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid farm ID');
    }

    const farm = await this.farmModel
      .findById(id)
      .populate('producerId', 'name cpfCnpj email')
      .exec();

    if (!farm) {
      throw new NotFoundException('Farm not found');
    }

    return farm;
  }

  async findByProducer(producerId: string): Promise<Farm[]> {
    if (!Types.ObjectId.isValid(producerId)) {
      throw new BadRequestException('Invalid producer ID');
    }

    return await this.farmModel
      .find({ producerId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async update(id: string, updateFarmDto: UpdateFarmDto): Promise<Farm> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid farm ID');
    }

    const existingFarm = await this.farmModel.findById(id);
    if (!existingFarm) {
      throw new NotFoundException('Farm not found');
    }

    // If updating name, check for conflicts
    if (updateFarmDto.name && updateFarmDto.name !== existingFarm.name) {
      const conflictFarm = await this.farmModel.findOne({
        _id: { $ne: id },
        producerId: existingFarm.producerId,
        name: updateFarmDto.name,
      });

      if (conflictFarm) {
        throw new ConflictException('A farm with this name already exists for this producer');
      }
    }

    // Validate area calculations if any area fields are being updated
    const totalArea = updateFarmDto.totalArea ?? existingFarm.totalArea;
    const agriculturalArea = updateFarmDto.agriculturalArea ?? existingFarm.agriculturalArea;
    const vegetationArea = updateFarmDto.vegetationArea ?? existingFarm.vegetationArea;

    const totalUsed = agriculturalArea + vegetationArea;
    if (totalUsed > totalArea) {
      throw new BadRequestException('Agricultural area + vegetation area cannot exceed total area');
    } const updatedFarm = await this.farmModel
      .findByIdAndUpdate(id, updateFarmDto, { new: true, runValidators: true })
      .populate('producerId', 'name cpfCnpj email')
      .exec();

    if (!updatedFarm) {
      throw new NotFoundException('Farm not found');
    }

    return updatedFarm;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid farm ID');
    }

    const result = await this.farmModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Farm not found');
    }
  }

  async getByState(): Promise<{ state: string; count: number; totalArea: number }[]> {
    return await this.farmModel.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
          totalArea: { $sum: '$totalArea' },
        },
      },
      {
        $project: {
          _id: 0,
          state: '$_id',
          count: 1,
          totalArea: 1,
        },
      },
      {
        $sort: { totalArea: -1 },
      },
    ]);
  }

  async getCropStatistics(): Promise<{ crop: string; count: number; totalArea: number }[]> {
    return await this.farmModel.aggregate([
      { $unwind: '$crops' },
      {
        $group: {
          _id: '$crops',
          count: { $sum: 1 },
          totalArea: { $sum: '$agriculturalArea' },
        },
      },
      {
        $project: {
          _id: 0,
          crop: '$_id',
          count: 1,
          totalArea: 1,
        },
      },
      {
        $sort: { totalArea: -1 },
      },
    ]);
  }

  async getAreaStatistics(): Promise<{
    totalFarms: number;
    totalArea: number;
    totalAgriculturalArea: number;
    totalVegetationArea: number;
    averageFarmSize: number;
  }> {
    const stats = await this.farmModel.aggregate([
      {
        $group: {
          _id: null,
          totalFarms: { $sum: 1 },
          totalArea: { $sum: '$totalArea' },
          totalAgriculturalArea: { $sum: '$agriculturalArea' },
          totalVegetationArea: { $sum: '$vegetationArea' },
          averageFarmSize: { $avg: '$totalArea' },
        },
      },
    ]);

    return stats[0] || {
      totalFarms: 0,
      totalArea: 0,
      totalAgriculturalArea: 0,
      totalVegetationArea: 0,
      averageFarmSize: 0,
    };
  }

  async validateProducerExists(producerId: string): Promise<boolean> {
    // This would typically inject ProducerService and check if producer exists
    // For now, just validate the ID format
    return Types.ObjectId.isValid(producerId);
  }
}

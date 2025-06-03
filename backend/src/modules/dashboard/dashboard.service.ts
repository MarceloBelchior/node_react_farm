import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producer, ProducerDocument } from '../producer/producer.schema';
import { Farm, FarmDocument } from '../farm/farm.schema';

export interface DashboardStats {
  totalProducers: number;
  totalFarms: number;
  totalArea: number;
  totalAgriculturalArea: number;
  totalVegetationArea: number;
  averageFarmSize: number;
  farmsByState: Array<{
    state: string;
    count: number;
    totalArea: number;
  }>;
  cropStatistics: Array<{
    crop: string;
    count: number;
    totalArea: number;
    percentage: number;
  }>;
  landUseDistribution: {
    agricultural: {
      area: number;
      percentage: number;
    };
    vegetation: {
      area: number;
      percentage: number;
    };
    unused: {
      area: number;
      percentage: number;
    };
  };
  topStates: Array<{
    state: string;
    farmCount: number;
    totalArea: number;
    averageSize: number;
  }>;
  recentActivity: {
    newProducersLastMonth: number;
    newFarmsLastMonth: number;
    totalGrowthPercentage: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectModel(Producer.name) private producerModel: Model<ProducerDocument>,
    @InjectModel(Farm.name) private farmModel: Model<FarmDocument>,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    // Get basic counts
    const [totalProducers, totalFarms] = await Promise.all([
      this.producerModel.countDocuments(),
      this.farmModel.countDocuments(),
    ]);

    // Get area statistics
    const areaStats = await this.farmModel.aggregate([
      {
        $group: {
          _id: null,
          totalArea: { $sum: '$totalArea' },
          totalAgriculturalArea: { $sum: '$agriculturalArea' },
          totalVegetationArea: { $sum: '$vegetationArea' },
          averageFarmSize: { $avg: '$totalArea' },
        },
      },
    ]);

    const areaData = areaStats[0] || {
      totalArea: 0,
      totalAgriculturalArea: 0,
      totalVegetationArea: 0,
      averageFarmSize: 0,
    };

    // Get farms by state
    const farmsByState = await this.farmModel.aggregate([
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

    // Get crop statistics
    const cropStats = await this.farmModel.aggregate([
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

    // Calculate crop percentages
    const totalCropArea = cropStats.reduce((sum, crop) => sum + crop.totalArea, 0);
    const cropStatistics = cropStats.map(crop => ({
      ...crop,
      percentage: totalCropArea > 0 ? (crop.totalArea / totalCropArea) * 100 : 0,
    }));

    // Calculate land use distribution
    const unusedArea = areaData.totalArea - (areaData.totalAgriculturalArea + areaData.totalVegetationArea);
    const landUseDistribution = {
      agricultural: {
        area: areaData.totalAgriculturalArea,
        percentage: areaData.totalArea > 0 ? (areaData.totalAgriculturalArea / areaData.totalArea) * 100 : 0,
      },
      vegetation: {
        area: areaData.totalVegetationArea,
        percentage: areaData.totalArea > 0 ? (areaData.totalVegetationArea / areaData.totalArea) * 100 : 0,
      },
      unused: {
        area: unusedArea,
        percentage: areaData.totalArea > 0 ? (unusedArea / areaData.totalArea) * 100 : 0,
      },
    };

    // Get top states by area with additional metrics
    const topStates = await this.farmModel.aggregate([
      {
        $group: {
          _id: '$state',
          farmCount: { $sum: 1 },
          totalArea: { $sum: '$totalArea' },
          averageSize: { $avg: '$totalArea' },
        },
      },
      {
        $project: {
          _id: 0,
          state: '$_id',
          farmCount: 1,
          totalArea: 1,
          averageSize: 1,
        },
      },
      {
        $sort: { totalArea: -1 },
      },
      {
        $limit: 10,
      },
    ]);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [newProducersLastMonth, newFarmsLastMonth] = await Promise.all([
      this.producerModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      this.farmModel.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    ]);

    // Calculate growth percentage (assuming we have historical data)
    const totalGrowthPercentage = totalProducers > 0 ? 
      ((newProducersLastMonth + newFarmsLastMonth) / (totalProducers + totalFarms)) * 100 : 0;

    return {
      totalProducers,
      totalFarms,
      totalArea: areaData.totalArea,
      totalAgriculturalArea: areaData.totalAgriculturalArea,
      totalVegetationArea: areaData.totalVegetationArea,
      averageFarmSize: areaData.averageFarmSize,
      farmsByState,
      cropStatistics,
      landUseDistribution,
      topStates,
      recentActivity: {
        newProducersLastMonth,
        newFarmsLastMonth,
        totalGrowthPercentage,
      },
    };
  }

  async getProducersByState(): Promise<Array<{ state: string; count: number }>> {
    return await this.producerModel.aggregate([
      {
        $group: {
          _id: '$state',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          state: '$_id',
          count: 1,
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);
  }

  async getFarmSizeDistribution(): Promise<Array<{ range: string; count: number }>> {
    return await this.farmModel.aggregate([
      {
        $bucket: {
          groupBy: '$totalArea',
          boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
          default: 'Other',
          output: {
            count: { $sum: 1 },
            averageArea: { $avg: '$totalArea' },
          },
        },
      },
      {
        $project: {
          range: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 0] }, then: '0-100 ha' },
                { case: { $eq: ['$_id', 100] }, then: '100-500 ha' },
                { case: { $eq: ['$_id', 500] }, then: '500-1000 ha' },
                { case: { $eq: ['$_id', 1000] }, then: '1000-5000 ha' },
                { case: { $eq: ['$_id', 5000] }, then: '5000-10000 ha' },
                { case: { $eq: ['$_id', 10000] }, then: '10000+ ha' },
              ],
              default: 'Other',
            },
          },
          count: 1,
          averageArea: 1,
        },
      },
    ]);
  }

  async getMonthlyGrowth(): Promise<Array<{ month: string; producers: number; farms: number }>> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const [producerGrowth, farmGrowth] = await Promise.all([
      this.producerModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),
      this.farmModel.aggregate([
        {
          $match: {
            createdAt: { $gte: sixMonthsAgo },
          },
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        {
          $sort: { '_id.year': 1, '_id.month': 1 },
        },
      ]),
    ]);

    // Merge and format the data
    const monthlyData = new Map();
    
    producerGrowth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      monthlyData.set(key, { 
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        producers: item.count,
        farms: 0 
      });
    });

    farmGrowth.forEach(item => {
      const key = `${item._id.year}-${item._id.month}`;
      const existing = monthlyData.get(key) || { 
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        producers: 0,
        farms: 0 
      };
      existing.farms = item.count;
      monthlyData.set(key, existing);
    });

    return Array.from(monthlyData.values()).sort((a, b) => a.month.localeCompare(b.month));
  }
}

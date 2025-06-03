import { Request, Response } from 'express';
import { PipelineStage } from 'mongoose';
import { Farm } from '../models/Farm';
import { Producer } from '../models/Producer';
import { IApiResponse, IDashboardData } from '../types';
import { logger } from '../config/logger';

export class DashboardController {  // Get dashboard statistics
  static async getStats(_req: Request, res: Response): Promise<void> {
    try {
      // Get all farms with their data
      const farms = await Farm.find({}).lean();
      const producers = await Producer.find({}).lean();

      // Calculate basic statistics
      const totalFarms = farms.length;
      const totalProducers = producers.length;
      const totalHectares = farms.reduce((sum, farm) => sum + farm.totalArea, 0);

      // Calculate farms by state
      const farmsByState: { [state: string]: number } = {};
      farms.forEach(farm => {
        farmsByState[farm.state] = (farmsByState[farm.state] || 0) + 1;
      });

      // Calculate farms by crop
      const farmsByCrop: { [crop: string]: number } = {};
      farms.forEach(farm => {
        farm.crops.forEach(crop => {
          farmsByCrop[crop.name] = (farmsByCrop[crop.name] || 0) + 1;
        });
      });

      // Calculate land use
      const agriculturalArea = farms.reduce((sum, farm) => sum + farm.agriculturalArea, 0);
      const vegetationArea = farms.reduce((sum, farm) => sum + farm.vegetationArea, 0);

      // Calculate additional statistics
      const averageFarmSize = totalFarms > 0 ? totalHectares / totalFarms : 0;
      const totalCrops = farms.reduce((sum, farm) => sum + farm.crops.length, 0);

      // Top states by farm count
      const topStates = Object.entries(farmsByState)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([state, count]) => ({ state, count }));

      // Top crops by farm count
      const topCrops = Object.entries(farmsByCrop)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([crop, count]) => ({ crop, count }));

      const dashboardData: IDashboardData & {
        totalProducers: number;
        averageFarmSize: number;
        totalCrops: number;
        topStates: Array<{ state: string; count: number }>;
        topCrops: Array<{ crop: string; count: number }>;
      } = {
        totalFarms,
        totalProducers,
        totalHectares: Math.round(totalHectares * 100) / 100,
        averageFarmSize: Math.round(averageFarmSize * 100) / 100,
        totalCrops,
        farmsByState,
        farmsByCrop,
        landUse: {
          agricultural: Math.round(agriculturalArea * 100) / 100,
          vegetation: Math.round(vegetationArea * 100) / 100,
        },
        topStates,
        topCrops
      };

      const response: IApiResponse = {
        success: true,
        data: dashboardData
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching dashboard stats:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar estatísticas do dashboard'
      };
      res.status(500).json(response);
    }
  }
  // Get farms by state statistics
  static async getFarmsByState(_req: Request, res: Response): Promise<void> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $group: {
            _id: '$state',
            count: { $sum: 1 },
            totalArea: { $sum: '$totalArea' },
            agriculturalArea: { $sum: '$agriculturalArea' },
            vegetationArea: { $sum: '$vegetationArea' }
          }
        },
        {
          $project: {
            state: '$_id',
            count: 1,
            totalArea: { $round: ['$totalArea', 2] },
            agriculturalArea: { $round: ['$agriculturalArea', 2] },
            vegetationArea: { $round: ['$vegetationArea', 2] },
            _id: 0
          }
        },
        { $sort: { count: -1 } }
      ];

      const result = await Farm.aggregate(pipeline);

      const response: IApiResponse = {
        success: true,
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching farms by state:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar fazendas por estado'
      };
      res.status(500).json(response);
    }
  }
  // Get crops statistics
  static async getCropsStats(_req: Request, res: Response): Promise<void> {
    try {
      const pipeline: PipelineStage[] = [
        { $unwind: '$crops' },
        {
          $group: {
            _id: {
              crop: '$crops.name',
              harvest: '$crops.harvest'
            },
            farmCount: { $sum: 1 },
            totalPlantedArea: { $sum: '$crops.plantedArea' },
            states: { $addToSet: '$state' }
          }
        },
        {
          $group: {
            _id: '$_id.crop',
            totalFarms: { $sum: '$farmCount' },
            harvests: {
              $push: {
                harvest: '$_id.harvest',
                farmCount: '$farmCount',
                totalPlantedArea: '$totalPlantedArea'
              }
            },
            uniqueStates: { $addToSet: '$states' }
          }
        },
        {
          $project: {
            crop: '$_id',
            totalFarms: 1,
            harvests: 1,
            statesCount: { $size: { $reduce: {
              input: '$uniqueStates',
              initialValue: [],
              in: { $setUnion: ['$$value', '$$this'] }
            }}},
            _id: 0
          }
        },
        { $sort: { totalFarms: -1 } }
      ];

      const result = await Farm.aggregate(pipeline);

      const response: IApiResponse = {
        success: true,
        data: result
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching crops stats:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar estatísticas de culturas'
      };
      res.status(500).json(response);
    }
  }
  // Get land use statistics
  static async getLandUseStats(_req: Request, res: Response): Promise<void> {
    try {
      const pipeline = [
        {
          $group: {
            _id: null,
            totalArea: { $sum: '$totalArea' },
            totalAgriculturalArea: { $sum: '$agriculturalArea' },
            totalVegetationArea: { $sum: '$vegetationArea' },
            farmCount: { $sum: 1 }
          }
        },
        {
          $project: {
            totalArea: { $round: ['$totalArea', 2] },
            agriculturalArea: { $round: ['$totalAgriculturalArea', 2] },
            vegetationArea: { $round: ['$totalVegetationArea', 2] },
            unusedArea: { 
              $round: [
                { $subtract: ['$totalArea', { $add: ['$totalAgriculturalArea', '$totalVegetationArea'] }] },
                2
              ]
            },
            agriculturalPercentage: {
              $round: [
                { $multiply: [{ $divide: ['$totalAgriculturalArea', '$totalArea'] }, 100] },
                2
              ]
            },
            vegetationPercentage: {
              $round: [
                { $multiply: [{ $divide: ['$totalVegetationArea', '$totalArea'] }, 100] },
                2
              ]
            },
            farmCount: 1,
            _id: 0
          }
        }
      ];

      const result = await Farm.aggregate(pipeline);
      const data = result[0] || {
        totalArea: 0,
        agriculturalArea: 0,
        vegetationArea: 0,
        unusedArea: 0,
        agriculturalPercentage: 0,
        vegetationPercentage: 0,
        farmCount: 0
      };

      const response: IApiResponse = {
        success: true,
        data
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching land use stats:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar estatísticas de uso do solo'
      };
      res.status(500).json(response);
    }
  }
  // Get growth statistics (farms and area over time)
  static async getGrowthStats(_req: Request, res: Response): Promise<void> {
    try {
      const pipeline: PipelineStage[] = [
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            farmCount: { $sum: 1 },
            totalArea: { $sum: '$totalArea' }
          }
        },
        {
          $project: {
            date: {
              $dateFromParts: {
                year: '$_id.year',
                month: '$_id.month',
                day: 1
              }
            },
            farmCount: 1,
            totalArea: { $round: ['$totalArea', 2] },
            _id: 0
          }
        },
        { $sort: { date: 1 } }
      ];

      const result = await Farm.aggregate(pipeline);

      // Calculate cumulative data
      let cumulativeFarms = 0;
      let cumulativeArea = 0;

      const growthData = result.map(item => {
        cumulativeFarms += item.farmCount;
        cumulativeArea += item.totalArea;

        return {
          ...item,
          cumulativeFarms,
          cumulativeArea: Math.round(cumulativeArea * 100) / 100
        };
      });

      const response: IApiResponse = {
        success: true,
        data: growthData
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching growth stats:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar estatísticas de crescimento'
      };
      res.status(500).json(response);    }
  }
}

// Export individual functions for compatibility with routes
export const getDashboardStats = DashboardController.getStats;
export const getFarmsByState = DashboardController.getFarmsByState;
export const getCropDistribution = DashboardController.getCropsStats;
export const getLandUseDistribution = DashboardController.getLandUseStats;
export const getFarmSizeDistribution = DashboardController.getGrowthStats;
export const getTopProducers = DashboardController.getStats; // Using same method for now

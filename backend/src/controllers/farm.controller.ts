import { Request, Response } from 'express';
import { Farm } from '../models/Farm';
import { Producer } from '../models/Producer';
import { IApiResponse, IQueryOptions } from '../types';
import { logger } from '../config/logger';

export class FarmController {
  // Get all farms with pagination and filtering
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        state = '',
        crop = '',
        sort = '-createdAt'
      }: IQueryOptions = req.query;

      const pageNum = Math.max(1, parseInt(page.toString()));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit.toString())));
      const skip = (pageNum - 1) * limitNum;

      // Build query
      const query: any = {};
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { city: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (state) {
        query.state = state.toUpperCase();
      }
      
      if (crop) {
        query['crops.name'] = crop;
      }

      // Execute queries in parallel
      const [farms, total] = await Promise.all([
        Farm.find(query)
          .sort(sort.toString())
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Farm.countDocuments(query)
      ]);

      // Get producer names
      const producerIds = farms.map(f => f.producerId);
      const producers = await Producer.find(
        { _id: { $in: producerIds } },
        'name'
      ).lean();

      const producerMap = producers.reduce((acc, producer) => {
        acc[producer._id.toString()] = producer.name;
        return acc;
      }, {} as Record<string, string>);

      // Add producer names to farms
      const farmsWithProducers = farms.map(farm => ({
        ...farm,
        id: farm._id,
        producerName: producerMap[farm.producerId] || 'Produtor não encontrado'
      }));

      const response: IApiResponse = {
        success: true,
        data: farmsWithProducers,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching farms:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar fazendas'
      };
      res.status(500).json(response);
    }
  }

  // Get farm by ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const farm = await Farm.findById(id).lean();
      
      if (!farm) {
        const response: IApiResponse = {
          success: false,
          error: 'Fazenda não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      // Get producer information
      const producer = await Producer.findById(farm.producerId, 'name cpfCnpj').lean();

      const response: IApiResponse = {
        success: true,
        data: {
          ...farm,
          id: farm._id,
          producer: producer ? {
            id: producer._id,
            name: producer.name,
            cpfCnpj: producer.cpfCnpj
          } : null
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar fazenda'
      };
      res.status(500).json(response);
    }
  }

  // Get farms by producer ID
  static async getByProducerId(req: Request, res: Response): Promise<void> {
    try {
      const { producerId } = req.params;
      
      // Verify producer exists
      const producer = await Producer.findById(producerId, 'name').lean();
      if (!producer) {
        const response: IApiResponse = {
          success: false,
          error: 'Produtor não encontrado'
        };
        res.status(404).json(response);
        return;
      }

      const farms = await Farm.find({ producerId }).sort('-createdAt').lean();

      const response: IApiResponse = {
        success: true,
        data: farms.map(farm => ({
          ...farm,
          id: farm._id,
          producerName: producer.name
        }))
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching farms by producer:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar fazendas do produtor'
      };
      res.status(500).json(response);
    }
  }

  // Create new farm
  static async create(req: Request, res: Response): Promise<void> {
    try {
      // Verify producer exists
      const producer = await Producer.findById(req.body.producerId);
      if (!producer) {
        const response: IApiResponse = {
          success: false,
          error: 'Produtor não encontrado'
        };
        res.status(404).json(response);
        return;
      }

      const farm = new Farm(req.body);
      await farm.save();

      logger.info(`Farm created: ${farm._id} for producer: ${req.body.producerId}`);

      const response: IApiResponse = {
        success: true,
        data: farm.toJSON(),
        message: 'Fazenda criada com sucesso'
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao criar fazenda'
      };
      res.status(500).json(response);
    }
  }

  // Update farm
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // If producerId is being updated, verify new producer exists
      if (req.body.producerId) {
        const producer = await Producer.findById(req.body.producerId);
        if (!producer) {
          const response: IApiResponse = {
            success: false,
            error: 'Produtor não encontrado'
          };
          res.status(404).json(response);
          return;
        }
      }

      const farm = await Farm.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!farm) {
        const response: IApiResponse = {
          success: false,
          error: 'Fazenda não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      logger.info(`Farm updated: ${farm._id}`);

      const response: IApiResponse = {
        success: true,
        data: farm.toJSON(),
        message: 'Fazenda atualizada com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error updating farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao atualizar fazenda'
      };
      res.status(500).json(response);
    }
  }

  // Delete farm
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const farm = await Farm.findByIdAndDelete(id);

      if (!farm) {
        const response: IApiResponse = {
          success: false,
          error: 'Fazenda não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      logger.info(`Farm deleted: ${id}`);

      const response: IApiResponse = {
        success: true,
        message: 'Fazenda excluída com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error deleting farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao excluir fazenda'
      };
      res.status(500).json(response);
    }
  }

  // Add crop to farm
  static async addCrop(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cropData = req.body;

      const farm = await Farm.findById(id);
      if (!farm) {
        const response: IApiResponse = {
          success: false,
          error: 'Fazenda não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      // Check for duplicate crop in same harvest
      const existingCrop = farm.crops.find(
        crop => crop.name === cropData.name && crop.harvest === cropData.harvest
      );

      if (existingCrop) {
        const response: IApiResponse = {
          success: false,
          error: 'Esta cultura já está plantada nesta safra'
        };
        res.status(400).json(response);
        return;
      }

      farm.crops.push(cropData);
      await farm.save();

      logger.info(`Crop added to farm: ${id}`);

      const response: IApiResponse = {
        success: true,
        data: farm.toJSON(),
        message: 'Cultura adicionada com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error adding crop to farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao adicionar cultura'
      };
      res.status(500).json(response);
    }
  }

  // Remove crop from farm
  static async removeCrop(req: Request, res: Response): Promise<void> {
    try {
      const { id, cropId } = req.params;

      const farm = await Farm.findById(id);
      if (!farm) {
        const response: IApiResponse = {
          success: false,
          error: 'Fazenda não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const cropIndex = farm.crops.findIndex(crop => crop._id?.toString() === cropId);
      if (cropIndex === -1) {
        const response: IApiResponse = {
          success: false,
          error: 'Cultura não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      farm.crops.splice(cropIndex, 1);
      await farm.save();

      logger.info(`Crop removed from farm: ${id}`);

      const response: IApiResponse = {
        success: true,
        data: farm.toJSON(),
        message: 'Cultura removida com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {      logger.error('Error removing crop from farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao remover cultura'
      };
      res.status(500).json(response);
    }
  }

  // Update crop in farm
  static async updateCrop(req: Request, res: Response): Promise<void> {
    try {
      const { id, cropId } = req.params;
      const cropData = req.body;

      const farm = await Farm.findById(id);
      if (!farm) {
        const response: IApiResponse = {
          success: false,
          error: 'Fazenda não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      const cropIndex = farm.crops.findIndex(crop => crop._id?.toString() === cropId);
      if (cropIndex === -1) {
        const response: IApiResponse = {
          success: false,
          error: 'Cultura não encontrada'
        };
        res.status(404).json(response);
        return;
      }

      // Check for duplicate crop in same harvest (excluding current crop)
      const existingCrop = farm.crops.find(
        (crop, index) => 
          index !== cropIndex && 
          crop.name === cropData.name && 
          crop.harvest === cropData.harvest
      );

      if (existingCrop) {
        const response: IApiResponse = {
          success: false,
          error: 'Esta cultura já está plantada nesta safra'
        };
        res.status(400).json(response);
        return;
      }

      // Update the crop
      farm.crops[cropIndex] = { ...farm.crops[cropIndex], ...cropData };
      await farm.save();

      logger.info(`Crop updated in farm: ${id}`);

      const response: IApiResponse = {
        success: true,
        data: farm.toJSON(),
        message: 'Cultura atualizada com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error updating crop in farm:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao atualizar cultura'
      };
      res.status(500).json(response);
    }
  }
}

// Export individual functions for compatibility with routes
export const createFarm = FarmController.create;
export const getFarms = FarmController.getAll;
export const getFarmById = FarmController.getById;
export const updateFarm = FarmController.update;
export const deleteFarm = FarmController.delete;
export const addCropToFarm = FarmController.addCrop;
export const removeCropFromFarm = FarmController.removeCrop;
export const updateCropInFarm = FarmController.updateCrop;

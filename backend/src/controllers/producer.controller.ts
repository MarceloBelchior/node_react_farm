import { Request, Response } from 'express';
import { Producer } from '../models/Producer';
import { Farm } from '../models/Farm';
import { IApiResponse, IQueryOptions } from '../types';
import { logger } from '../config/logger';

export class ProducerController {
  // Get all producers with pagination and search
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const {
        page = 1,
        limit = 10,
        search = '',
        sort = '-createdAt'
      }: IQueryOptions = req.query;

      const pageNum = Math.max(1, parseInt(page.toString()));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit.toString())));
      const skip = (pageNum - 1) * limitNum;

      // Build search query
      const searchQuery = search
        ? {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { cpfCnpj: { $regex: search.replace(/[^\d]/g, ''), $options: 'i' } }
            ]
          }
        : {};

      // Execute queries in parallel
      const [producers, total] = await Promise.all([
        Producer.find(searchQuery)
          .sort(sort.toString())
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Producer.countDocuments(searchQuery)
      ]);

      // Get farm counts for each producer
      const producerIds = producers.map(p => p._id.toString());
      const farmCounts = await Farm.aggregate([
        { $match: { producerId: { $in: producerIds } } },
        { $group: { _id: '$producerId', count: { $sum: 1 } } }
      ]);

      const farmCountMap = farmCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>);

      // Add farm count to each producer
      const producersWithFarmCount = producers.map(producer => ({
        ...producer,
        id: producer._id,
        farmCount: farmCountMap[producer._id.toString()] || 0
      }));

      const response: IApiResponse = {
        success: true,
        data: producersWithFarmCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          pages: Math.ceil(total / limitNum)
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching producers:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar produtores'
      };
      res.status(500).json(response);
    }
  }

  // Get producer by ID
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const producer = await Producer.findById(id).lean();
      
      if (!producer) {
        const response: IApiResponse = {
          success: false,
          error: 'Produtor não encontrado'
        };
        res.status(404).json(response);
        return;
      }

      // Get producer's farms
      const farms = await Farm.find({ producerId: id }).lean();

      const response: IApiResponse = {
        success: true,
        data: {
          ...producer,
          id: producer._id,
          farms: farms.map(farm => ({
            ...farm,
            id: farm._id
          }))
        }
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error fetching producer:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao buscar produtor'
      };
      res.status(500).json(response);
    }
  }

  // Create new producer
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const producer = new Producer(req.body);
      await producer.save();

      logger.info(`Producer created: ${producer._id}`);

      const response: IApiResponse = {
        success: true,
        data: producer.toJSON(),
        message: 'Produtor criado com sucesso'
      };

      res.status(201).json(response);
    } catch (error) {
      logger.error('Error creating producer:', error);
      
      // Check for duplicate CPF/CNPJ
      if ((error as any).code === 11000) {
        const response: IApiResponse = {
          success: false,
          error: 'CPF/CNPJ já está cadastrado'
        };
        res.status(400).json(response);
        return;
      }

      const response: IApiResponse = {
        success: false,
        error: 'Erro ao criar produtor'
      };
      res.status(500).json(response);
    }
  }

  // Update producer
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      const producer = await Producer.findByIdAndUpdate(
        id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!producer) {
        const response: IApiResponse = {
          success: false,
          error: 'Produtor não encontrado'
        };
        res.status(404).json(response);
        return;
      }

      logger.info(`Producer updated: ${producer._id}`);

      const response: IApiResponse = {
        success: true,
        data: producer.toJSON(),
        message: 'Produtor atualizado com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error updating producer:', error);
      
      // Check for duplicate CPF/CNPJ
      if ((error as any).code === 11000) {
        const response: IApiResponse = {
          success: false,
          error: 'CPF/CNPJ já está cadastrado'
        };
        res.status(400).json(response);
        return;
      }

      const response: IApiResponse = {
        success: false,
        error: 'Erro ao atualizar produtor'
      };
      res.status(500).json(response);
    }
  }

  // Delete producer
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      
      // Check if producer has farms
      const farmCount = await Farm.countDocuments({ producerId: id });
      
      if (farmCount > 0) {
        const response: IApiResponse = {
          success: false,
          error: 'Não é possível excluir produtor que possui fazendas cadastradas'
        };
        res.status(400).json(response);
        return;
      }

      const producer = await Producer.findByIdAndDelete(id);

      if (!producer) {
        const response: IApiResponse = {
          success: false,
          error: 'Produtor não encontrado'
        };
        res.status(404).json(response);
        return;
      }

      logger.info(`Producer deleted: ${id}`);

      const response: IApiResponse = {
        success: true,
        message: 'Produtor excluído com sucesso'
      };

      res.status(200).json(response);
    } catch (error) {
      logger.error('Error deleting producer:', error);
      const response: IApiResponse = {
        success: false,
        error: 'Erro ao excluir produtor'
      };
      res.status(500).json(response);    }
  }
}

// Export individual functions for compatibility with routes
export const createProducer = ProducerController.create;
export const getProducers = ProducerController.getAll;
export const getProducerById = ProducerController.getById;
export const updateProducer = ProducerController.update;
export const deleteProducer = ProducerController.delete;

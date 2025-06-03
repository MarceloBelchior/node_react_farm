import { Request, Response } from 'express';
import { IApiResponse } from '../types';

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: IApiResponse = {
    success: false,
    error: `Rota ${req.originalUrl} não encontrada`
  };

  res.status(404).json(response);
};

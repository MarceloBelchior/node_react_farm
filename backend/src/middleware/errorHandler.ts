import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { IApiResponse } from '../types';

export interface CustomError extends Error {
  statusCode?: number;
  code?: string | number;
  errors?: any;
  keyValue?: any;
  value?: any;
  path?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`Error: ${err.message}`, {
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  });

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Recurso não encontrado';
    error = { ...error, message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    const message = `${field === 'cpfCnpj' ? 'CPF/CNPJ' : field} já está em uso`;
    error = { ...error, message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((val: any) => ({
      field: val.path,
      message: val.message
    }));
    const message = 'Dados inválidos fornecidos';
    error = { ...error, message, statusCode: 400, errors };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { ...error, message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { ...error, message, statusCode: 401 };
  }

  const response: IApiResponse = {
    success: false,
    error: error.message || 'Erro interno do servidor',
    ...(error.errors && { data: error.errors })
  };

  res.status(error.statusCode || 500).json(response);
};

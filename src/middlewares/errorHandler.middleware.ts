import type { Request, Response, NextFunction } from 'express';

import config from '@/config/config.ts';

import { Environment } from '@/enums/env.enum.ts';

import { logger } from '@/utils/logger.util.ts';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const { statusCode = 500, message, stack, isOperational } = err;
  const status = statusCode >= 500 ? 'error' : 'fail';
  const { nodeEnv } = config;

  logger({ level: 'error', message: err });

  if (nodeEnv === Environment.Development) {
    res.status(statusCode).json({
      status,
      message,
      stack,
    });
    return;
  }

  if (!isOperational) {
    res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
    });
    return;
  }

  res.status(statusCode).json({
    status,
    message,
  });
};

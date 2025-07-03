import type { Request, Response, NextFunction } from 'express';
import { authenticateToken } from '@/middlewares/authenticateToken.middleware.ts';

export function authMiddlewareExceptAuthRoutes(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (req.path.startsWith('/auth')) {
    return next();
  }
  authenticateToken(req, res, next);
}

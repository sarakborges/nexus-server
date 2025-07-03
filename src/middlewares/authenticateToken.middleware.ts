import type { Request, Response, NextFunction } from 'express';
import type { JwtPayload } from 'jsonwebtoken';
import { verifyJwt } from '@/utils/jwt.util.ts';

interface UserPayload extends JwtPayload {
  _id: string;
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: 'Token não fornecido' });
      return;
    }

    const decoded = (await verifyJwt(token)) as JwtPayload | string;

    if (!decoded || typeof decoded === 'string') {
      res.status(403).json({ message: 'Token inválido' });
      return;
    }

    if (!('_id' in decoded) || typeof decoded._id !== 'string') {
      res.status(403).json({ message: 'Token inválido' });
      return;
    }

    req.user = decoded as UserPayload;

    next();
  } catch {
    res.status(403).json({ message: 'Token inválido' });
  }
};

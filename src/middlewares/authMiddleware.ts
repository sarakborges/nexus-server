import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';
import config from '../config/config.ts';

function verifyJwt(
  token: string,
  secret: string,
): Promise<string | JwtPayload> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) return reject(err);
      resolve(decoded!);
    });
  });
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

    const decoded = (await verifyJwt(token, config.jwtSecret)) as
      | Express.UserPayload
      | string;

    if (!decoded || typeof decoded === 'string' || !decoded._id) {
      res.status(403).json({ message: 'Token inválido' });
      return;
    }

    req.user = decoded;

    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido' });
    return;
  }
};

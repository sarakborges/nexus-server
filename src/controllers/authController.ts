import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { User } from '../models/user.ts';
import { getDb } from '../config/db.ts';
import config from '../config/config.ts';

// Create an user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /auth/register');

  try {
    const newUser: User = { ...req.body };

    const db = await getDb();
    const collection = await db?.collection<User>('users');
    await collection?.insertOne(newUser);

    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
};

// Login user
export const doLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /auth/login');

  try {
    const db = await getDb();
    const collection = await db?.collection<User>('users');
    const user = await collection?.findOne({ ...req.body });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
      expiresIn: '1h',
    });

    const refreshToken = jwt.sign({ _id: user._id }, config.jwtRefreshSecret, {
      expiresIn: '7d',
    });

    res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        path: '/auth/refresh',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({ token });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  console.log('Access POST /auth/refresh');

  const token = req.cookies.refreshToken;

  if (!token) {
    res.sendStatus(401);
    return;
  } // Não autenticado

  try {
    const decoded = jwt.verify(
      token,
      config.jwtRefreshSecret,
    ) as Express.UserPayload;

    if (!decoded._id) {
      res.sendStatus(403); // Token malformado
      return;
    }

    const newAccessToken = jwt.sign(
      { _id: decoded._id },
      config.jwtSecret, // ✅ segredo correto aqui
      { expiresIn: '1h' },
    );

    res.status(200).json({ token: newAccessToken });
  } catch (err) {
    res.sendStatus(403); // Token inválido
  }
};

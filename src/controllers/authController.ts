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
  console.log('Access POST /users');

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
  console.log('Access POST /users/login');

  try {
    const db = await getDb();
    const collection = await db?.collection<User>('users');
    const user = await collection?.findOne({ ...req.body });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const token = jwt.sign(user._id, config.jwtSecret, {
      expiresIn: '1h',
    });

    res.status(200).json({ token });
  } catch (error) {
    next(error);
  }
};

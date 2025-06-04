import type { Request, Response, NextFunction } from 'express';
import type { User } from '../models/user.ts';
import { getDb } from '../config/db.ts';

// Create an user
export const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /users');

  try {
    const { email, password } = req.body;
    const newUser: User = { id: Date.now(), email, password };

    const db = await getDb();
    const collection = await db?.collection('users');
    await collection?.insertOne(newUser);

    res.send(newUser).status(201);
  } catch (error) {
    next(error);
  }
};

// Update an user profiles
export const updateUserProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /users/:id');

  try {
    const { profiles, activeProfile } = req.body;
    const id = parseInt(req.params.id, 10);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.updateOne(
      { id },
      { profiles, activeProfile },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.send().status(200);
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
    const { email, password } = req.body;

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.findOne({ email, password });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user).status(200);
  } catch (error) {
    next(error);
  }
};

// Read single user
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /users/:id');

  try {
    const id = parseInt(req.params.id, 10);
    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.findOne({ id });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user).status(200);
  } catch (error) {
    next(error);
  }
};

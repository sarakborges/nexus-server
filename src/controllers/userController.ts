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

    res.status(201).send(newUser);
  } catch (error) {
    next(error);
  }
};

// Read all profiles from user
export const getProfilesByUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /user/:id/profiles');

  try {
    const id = parseInt(req.params.id, 10);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profiles = await collection?.find({ userId: id }).toArray();

    if (!profiles) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

// Change which profile is active on user
export const changeUserActiveProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /users/:id/activeProfile');

  try {
    const { profile } = req.body;
    const id = parseInt(req.params.id, 10);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.updateOne(
      { id },
      { $set: { activeProfile: profile } },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

// Add a new profile to an user
export const addProfileToUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /users/:id/add');

  try {
    const { profile } = req.body;
    const id = parseInt(req.params.id, 10);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.updateOne(
      { id },
      { $push: { profiles: profile } },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).send();
  } catch (error) {
    next(error);
  }
};

// Remove an existing profile to an user
export const removeProfileFromUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /users/:id/remove');

  try {
    const { profile } = req.body;
    const id = parseInt(req.params.id, 10);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.updateOne(
      { id },
      { $pull: { profiles: profile } },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).send();
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

    res.status(200).json(user);
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

    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

import type { Request, Response, NextFunction } from 'express';
import type { User } from '../models/user.ts';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

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
    const collection = await db?.collection('users');
    await collection?.insertOne(newUser);

    res.status(201).send(newUser);
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
    const id = new ObjectId(req.params.id);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.findOneAndUpdate(
      { _id: id },
      { $set: { activeProfile: profile } },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).send(user);
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
    const id = new ObjectId(req.params.id);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.findOneAndUpdate(
      { _id: id },
      { $push: { profiles: profile } },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).send(user);
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
    const id = new ObjectId(req.params.id);

    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection?.findOneAndUpdate(
      { _id: id },
      { $pull: { profiles: profile } },
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).send(user);
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
    const collection = await db?.collection('users');
    const user = await collection?.findOne({ ...req.body });

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
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('users');
    const user = await collection
      ?.aggregate([
        { $match: { _id: id } },
        {
          $lookup: {
            from: 'profiles',
            localField: 'profiles',
            foreignField: '_id',
            as: 'profiles',
          },
        },
      ])
      .toArray();
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user[0]);
  } catch (error) {
    next(error);
  }
};

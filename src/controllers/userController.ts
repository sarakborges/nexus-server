import type { Request, Response, NextFunction } from 'express';
import type { User } from '../models/user.ts';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Change which profile is active on user
export const changeUserActiveProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /users/activeProfile');

  try {
    const profile = new ObjectId(req.body.profile as string);
    const _id = new ObjectId(req.user?._id);

    const db = await getDb();
    const collection = await db?.collection<User>('users');
    const user = await collection?.findOneAndUpdate(
      { _id },
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

// Read single user
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /users/me');

  try {
    if (!req.user) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const id = new ObjectId(req.user._id);
    const db = await getDb();
    const collection = await db?.collection<User>('users');
    const user = await collection
      ?.aggregate([
        { $match: { _id: id } },
        {
          $lookup: {
            from: 'profiles',
            localField: '_id',
            foreignField: 'userId',
            as: 'profiles',
          },
        },
      ])
      .toArray();
    if (!user?.length) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(user[0]);
  } catch (error) {
    next(error);
  }
};

import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Create an profile
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /profiles');

  try {
    const profile = { ...req.body };

    const db = await getDb();
    const collection = await db?.collection('profiles');
    await collection?.insertOne(profile);

    res.status(201).send(profile);
  } catch (error) {
    next(error);
  }
};

// Read all profiles
export const getProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /profiles');

  try {
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profiles = await collection?.find().toArray();

    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

// Read single profile
export const getProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /profiles/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.findOne({ _id: id });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// Update single profile
export const updateProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /profiles/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.updateOne({ _id: id }, { ...req.body });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// Delete single profile
export const deleteProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access DELETE /profiles/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.deleteOne({ _id: id });

    if (!profile.deletedCount) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

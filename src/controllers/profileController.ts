import type { Request, Response, NextFunction } from 'express';
import type { Profile } from '../models/profile.ts';
import { getDb } from '../config/db.ts';

// Create an profile
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /profiles');

  try {
    const { name, uri, picture, userId } = req.body;
    const newProfile: Profile = { id: Date.now(), name, uri, picture, userId };

    const db = await getDb();
    const collection = await db?.collection('profiles');
    await collection?.insertOne(newProfile);

    res.status(201).send(newProfile);
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
    const id = parseInt(req.params.id, 10);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.findOne({ id });

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
    const id = parseInt(req.params.id, 10);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.updateOne({ id }, { ...req.body });

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
    const id = parseInt(req.params.id, 10);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.deleteOne({ id });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

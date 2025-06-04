import type { Request, Response, NextFunction } from 'express';
import { profiles } from '../models/profile.ts';
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

    res.send(newProfile).status(201);
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

    res.json(profiles).status(200);
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

    res.json(profile).status(200);
  } catch (error) {
    next(error);
  }
};

// Update an profile
export const updateProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PUT /profiles/:id');

  try {
    const id = parseInt(req.params.id, 10);
    const { name } = req.body;
    const profileIndex = profiles.findIndex((i) => i.id === id);
    if (profileIndex === -1) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    profiles[profileIndex].name = name;
    res.json(profiles[profileIndex]);
  } catch (error) {
    next(error);
  }
};

// Delete an profile
export const deleteProfile = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access DELETE /profiles/:id');

  try {
    const id = parseInt(req.params.id, 10);
    const profileIndex = profiles.findIndex((i) => i.id === id);
    if (profileIndex === -1) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }
    const deletedProfile = profiles.splice(profileIndex, 1)[0];
    res.json(deletedProfile);
  } catch (error) {
    next(error);
  }
};

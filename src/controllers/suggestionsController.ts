import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';

// Read all profiles from user
export const getSuggestionsByProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /suggestions/:id');

  try {
    const id = parseInt(req.params.id);
    const db = await getDb();
    const profilesCollection = await db?.collection('profiles');
    const groupsCollection = await db?.collection('groups');
    const profile = await profilesCollection?.findOne({ id });

    const connections = profile?.connections || [];
    const groupsIn = profile?.groups || [];

    const profiles = await profilesCollection
      ?.find({ id: { $nin: [id, ...connections] } })
      .toArray();

    const groups = await groupsCollection
      ?.find({ id: { $nin: [...groupsIn] } })
      .toArray();

    if (!profiles?.length || !groups?.length) {
      res.status(404).json({ message: 'No suggestions found' });
      return;
    }

    res.status(200).json([
      {
        type: 'profile',
        suggestions: profiles,
      },

      {
        type: 'group',
        suggestions: groups,
      },
    ]);
  } catch (error) {
    next(error);
  }
};

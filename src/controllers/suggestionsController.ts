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
      ?.find({
        id: { $nin: [id, ...connections] },
        $expr: { $lt: [0.5, { $rand: {} }] },
      })
      .limit(3)
      .toArray();

    const groups = await groupsCollection
      ?.find({
        id: { $nin: [...groupsIn], $expr: { $lt: [0.5, { $rand: {} }] } },
      })
      .limit(3)
      .toArray();

    if (!profiles?.length && !groups?.length) {
      res.status(404).json({ message: 'No suggestions found' });
      return;
    }

    const suggestions = [];

    if (!!profiles?.length) {
      suggestions.push({
        type: 'profile',
        suggestions: profiles,
      });
    }

    if (!!groups?.length) {
      suggestions.push({
        type: 'group',
        suggestions: groups,
      });
    }

    res.status(200).json(suggestions);
  } catch (error) {
    next(error);
  }
};

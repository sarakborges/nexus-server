import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Read all profiles from user
export const getSuggestionsByProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /suggestions/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const profilesCollection = await db?.collection('profiles');
    const groupsCollection = await db?.collection('groups');
    const profile = await profilesCollection?.findOne({ _id: id });

    const connections = profile?.connections || [];
    const groupsIn = profile?.groups || [];

    const profiles = await profilesCollection
      ?.aggregate([
        { $match: { _id: { $nin: [id, ...connections] } } },
        { $sample: { size: 3 } },
      ])
      .toArray();

    const groups = await groupsCollection
      ?.aggregate([
        { $match: { _id: { $nin: [...groupsIn] } } },
        { $sample: { size: 3 } },
      ])
      .toArray();

    if (!profiles?.length && !groups?.length) {
      res.status(404).json({ message: 'No suggestions found' });
      return;
    }

    const suggestions = [];

    suggestions.push({
      type: 'profile',
      suggestions: profiles,
    });

    suggestions.push({
      type: 'group',
      suggestions: groups,
    });

    res.status(200).json(suggestions);
  } catch (error) {
    next(error);
  }
};

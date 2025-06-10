import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Read all feed from profile
export const getFeedByProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /feed/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const profilesCollection = await db?.collection('profiles');
    const feedCollection = await db?.collection('feed');
    const profile = await profilesCollection?.findOne({ _id: id });

    const connections = profile?.connections || [];

    const feed = await feedCollection
      ?.aggregate([
        { $match: { profileId: { $in: [id, ...connections] } } },
        {
          $lookup: {
            from: 'profiles',
            localField: 'profileId',
            foreignField: '_id',
            as: 'profile',
          },
        },
      ])
      .toArray();

    if (!feed?.length) {
      res.status(404).json({ message: 'No feed found' });
      return;
    }

    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
};

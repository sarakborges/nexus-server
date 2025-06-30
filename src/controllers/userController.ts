import type { Request, Response, NextFunction } from 'express';
import type { User } from '../models/user.ts';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';
import { fetchSuggestionsForProfile } from './suggestionsController.ts';
import { fetchFeedForProfile } from './feedController.ts';

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
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: 'Usuário não autenticado' });
    }

    const userId = new ObjectId(req.user._id);
    const db = await getDb();
    const usersCollection = db.collection('users');

    const [userWithProfiles] = await usersCollection
      .aggregate([
        { $match: { _id: userId } },
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

    if (!userWithProfiles) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Pega o perfil ativo do usuário (você pode adaptar se for outra lógica)
    const activeProfileId = userWithProfiles.activeProfile;
    if (!activeProfileId) {
      res.status(200).json({
        user: userWithProfiles,
      });

      return;
    }

    // Busca sugestões com a função genérica
    const suggestions = await fetchSuggestionsForProfile(activeProfileId);
    const feed = await fetchFeedForProfile(activeProfileId);

    const notifications = await db
      .collection('notifications')
      .aggregate([
        {
          $match: { to: new ObjectId(activeProfileId as string) },
        },
        {
          $addFields: {
            fromProfile: {
              $cond: {
                if: {
                  $in: [
                    '$type',
                    ['connectionRequested', 'connectionRequestAccepted'],
                  ],
                },
                then: '$from',
                else: null,
              },
            },
            fromGroup: {
              $cond: {
                if: { $eq: ['$type', 'membershipAccepted'] },
                then: '$from',
                else: null,
              },
            },
          },
        },
        {
          $lookup: {
            from: 'profiles',
            localField: 'fromProfile',
            foreignField: '_id',
            as: 'fromProfileData',
          },
        },
        {
          $lookup: {
            from: 'groups',
            localField: 'fromGroup',
            foreignField: '_id',
            as: 'fromGroupData',
          },
        },
        {
          $addFields: {
            from: {
              $cond: {
                if: {
                  $in: [
                    '$type',
                    ['connectionRequested', 'connectionRequestAccepted'],
                  ],
                },
                then: { $arrayElemAt: ['$fromProfileData', 0] },
                else: { $arrayElemAt: ['$fromGroupData', 0] },
              },
            },
          },
        },
        {
          $project: {
            fromProfileData: 0,
            fromGroupData: 0,
            fromProfile: 0,
            fromGroup: 0,
          },
        },
        {
          $sort: { at: -1 }, // -1 = ordem decrescente
        },
      ])
      .toArray();

    return res.status(200).json({
      user: userWithProfiles,
      suggestions,
      feed,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

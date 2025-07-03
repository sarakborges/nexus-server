import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';

import {
  updateUserActiveProfile,
  getUserById,
} from '@/services/user.service.ts';
import { getSuggestionsForProfile } from '@/services/suggestions.service.ts';
import { getFeedForProfile } from '@/services/feed.service.ts';
import { getNotificationsForProfile } from '@/services/notifications.service.ts';

import { logger } from '@/utils/logger.util.ts';

export const changeUserActiveProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'PATCH /users/activeProfile accessed' });

  try {
    const profileId = new ObjectId(req.body.profile as string);
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const updatedUser = await updateUserActiveProfile(userId, profileId);

    if (!updatedUser) {
      logger({ level: 'warn', message: `User not found for id: ${userId}` });
      res.status(404).json({ message: 'User not found' });
      return;
    }

    logger({
      level: 'info',
      message: `User ${userId} active profile changed to ${profileId}`,
    });
    res.status(200).json(updatedUser);
  } catch (error) {
    logger({
      level: 'error',
      message: `Error changing active profile: ${(error as Error).message}`,
    });
    next(error);
  }
};

export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      logger({
        level: 'warn',
        message: 'Unauthenticated access to GET /users/me',
      });
      res.status(401).json({ message: 'User not authenticated' });
      return;
    }

    const userWithProfiles = await getUserById(userId, {
      includeProfiles: true,
    });

    if (!userWithProfiles) {
      logger({ level: 'warn', message: `User not found for id: ${userId}` });
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const activeProfileId = userWithProfiles.activeProfile;

    if (!activeProfileId) {
      logger({
        level: 'info',
        message: `User ${userId} has no active profile`,
      });
      res.status(200).json({
        user: userWithProfiles,
        suggestions: [],
        feed: [],
        notifications: [],
      });
      return;
    }

    const [suggestions, feed, notifications] = await Promise.all([
      getSuggestionsForProfile(activeProfileId),
      getFeedForProfile(activeProfileId),
      getNotificationsForProfile(activeProfileId),
    ]);

    logger({
      level: 'info',
      message: `GET /users/me success for user ${userId}`,
    });
    res.status(200).json({
      user: userWithProfiles,
      suggestions,
      feed,
      notifications,
    });
  } catch (error) {
    logger({
      level: 'error',
      message: `Error fetching user info: ${(error as Error).message}`,
    });
    next(error);
  }
};

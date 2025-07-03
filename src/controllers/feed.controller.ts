import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';

import { getUserById } from '@/services/user.service.ts';
import {
  createFeedItem,
  deleteFeedItem,
  getFeedForProfile,
} from '@/services/feed.service.ts';
import { logger } from '@/utils/logger.util.ts';

export const createFeedItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access POST /feed' });

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await getUserById(req.user._id);
    if (!user || !user.activeProfile) {
      res.status(400).json({ message: 'Active profile not found' });
      return;
    }

    const feedItem = await createFeedItem(user.activeProfile, req.body);
    res.status(201).json(feedItem);
  } catch (error) {
    next(error);
  }
};

export const getFeedByProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access GET /feed' });

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await getUserById(req.user._id);
    if (!user || !user.activeProfile) {
      res.status(400).json({ message: 'Active profile not found' });
      return;
    }

    const feed = await getFeedForProfile(user.activeProfile);
    if (!feed.length) {
      res.status(404).json({ message: 'No feed found' });
      return;
    }

    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
};

export const deleteFeedItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access DELETE /feed/:id' });

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await getUserById(req.user._id);
    if (!user || !user.activeProfile) {
      res.status(400).json({ message: 'Active profile not found' });
      return;
    }

    const deleted = await deleteFeedItem(
      new ObjectId(req.params.id),
      user.activeProfile,
    );

    if (!deleted) {
      res.status(404).json({ message: 'Feed item not found' });
      return;
    }

    res.status(200).json({ deletedId: req.params.id });
  } catch (error) {
    next(error);
  }
};

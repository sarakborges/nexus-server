import type { Request, Response, NextFunction } from 'express';
import { ObjectId } from 'mongodb';

import {
  createConnection,
  acceptConnection,
  deleteConnection,
} from '@/services/connections.service.ts';
import { getUserById } from '@/services/user.service.ts';

import { logger } from '@/utils/logger.util.ts';

export const createConnectionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access POST /connections' });

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const user = await getUserById(req.user._id);
    const targetProfileId = req.body.profileId;

    const connectionId = await createConnection(
      new ObjectId(req.user._id),
      targetProfileId,
    );

    res.status(201).json({ _id: connectionId });
  } catch (error) {
    next(error);
  }
};

export const acceptConnectionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access PATCH /connections/:id' });

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const connectionId = req.params.id;

    const result = await acceptConnection(
      new ObjectId(req.user._id),
      connectionId,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteConnectionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access DELETE /connections/:id' });

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Not authenticated' });
      return;
    }

    const connectionId = req.params.id;

    const deletedId = await deleteConnection(
      new ObjectId(req.user._id),
      connectionId,
    );

    res.status(200).json({ _id: deletedId });
  } catch (error) {
    next(error);
  }
};

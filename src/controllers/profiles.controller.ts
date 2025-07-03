import type { Request, Response, NextFunction } from 'express';
import {
  createProfile,
  getProfileById,
  getProfileByUri,
  updateProfileById,
  deleteProfileById,
} from '@/services/profiles.service';

export const createProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?._id) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }

  try {
    const profile = await createProfile(req.user._id, req.body);
    res.status(201).json(profile);
  } catch (error: unknown) {
    if (error instanceof Error) next(error);
    else next(new Error('Unknown error'));
  }
};

export const findProfileByIdController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const profile = await getProfileById(req.params.id);
    res.status(200).json(profile);
  } catch {
    res.status(404).json({ message: 'Profile not found' });
  }
};

export const findProfileByUriController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  try {
    const uri = req.params.uri;
    const targetId = req.query.targetId as string;
    if (!targetId) {
      res.status(400).json({ message: 'targetId query param required' });
      return;
    }
    const profile = await getProfileByUri(uri, targetId);
    res.status(200).json(profile);
  } catch {
    res.status(404).json({ message: 'Profile not found' });
  }
};

export const updateProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?._id) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }
  try {
    const updatedProfile = await updateProfileById(req.user._id, req.body);
    res.status(200).json(updatedProfile);
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (
        error.message === 'User has no active profile' ||
        error.message === 'Profile not found'
      ) {
        res.status(404).json({ message: error.message });
      } else {
        next(error);
      }
    } else {
      next(new Error('Unknown error'));
    }
  }
};

export const removeProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user?._id) {
    res.status(401).json({ message: 'User not authenticated' });
    return;
  }
  try {
    await deleteProfileById(req.params.id, req.user._id);
    res.status(200).json({ message: 'Profile deleted' });
  } catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === 'Profile not found') {
        res.status(404).json({ message: 'Profile not found' });
      } else {
        next(error);
      }
    } else {
      next(new Error('Unknown error'));
    }
  }
};

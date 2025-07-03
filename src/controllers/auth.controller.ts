import type { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  createAccessToken,
  createRefreshToken,
  verifyRefreshToken,
} from '@/services/user.service.ts';
import { refreshTokenCookieOptions } from '@/utils/cookie.util.ts';
import { logger } from '@/utils/logger.util.ts';
import config from '@/config/config.ts';

export const createUserController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access POST /auth/register' });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await registerUser(email, password);
    const token = await createAccessToken(user._id.toString());
    const refreshToken = await createRefreshToken(user._id.toString());

    const cookieOptions = {
      ...refreshTokenCookieOptions,
      secure: config.nodeEnv === 'production',
    };

    res
      .status(201)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({ token, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const doLoginController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  logger({ level: 'info', message: 'Access POST /auth/login' });

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await loginUser(email, password);
    const token = await createAccessToken(user._id.toString());
    const refreshToken = await createRefreshToken(user._id.toString());

    const cookieOptions = {
      ...refreshTokenCookieOptions,
      secure: config.nodeEnv === 'production',
    };

    res
      .status(200)
      .cookie('refreshToken', refreshToken, cookieOptions)
      .json({ token, email: user.email });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (
  req: Request,
  res: Response,
  _next: NextFunction,
): Promise<void> => {
  logger({ level: 'info', message: 'Access POST /auth/refresh' });

  const token = req.cookies.refreshToken;
  if (!token) {
    res.sendStatus(401);
    return;
  }

  try {
    const decoded = await verifyRefreshToken(token);

    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('_id' in decoded) ||
      typeof decoded._id !== 'string'
    ) {
      res.sendStatus(403);
      return;
    }

    const newAccessToken = await createAccessToken(decoded._id);
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    res.sendStatus(403);
  }
};

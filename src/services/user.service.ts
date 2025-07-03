import { ObjectId, WithId } from 'mongodb';

import { getDb } from '@/config/db.ts';

import type { UserModel } from '@/models/user.model.ts';

import { hash } from '@/utils/hash.util.ts';
import { signJwt, verifyJwt } from '@/utils/jwt.util.ts';
import { logger } from '@/utils/logger.util.ts';

export class UserAlreadyExistsError extends Error {
  constructor(message = 'User already exists') {
    super(message);
    this.name = 'UserAlreadyExistsError';
  }
}

export class InvalidCredentialsError extends Error {
  constructor(message = 'Invalid credentials') {
    super(message);
    this.name = 'InvalidCredentialsError';
  }
}

export const registerUser = async (email: string, password: string) => {
  const db = await getDb();
  const collection = db.collection<Omit<UserModel, '_id'>>('users');

  const existingUser = await collection.findOne({ email });
  if (existingUser) {
    logger({
      level: 'warn',
      message: `Attempt to register existing user: ${email}`,
    });
    throw new UserAlreadyExistsError();
  }

  const encryptedPass = hash(password);
  const result = await collection.insertOne({ email, password: encryptedPass });

  logger({
    level: 'info',
    message: `User registered with id ${result.insertedId}`,
  });

  return {
    _id: result.insertedId,
    email,
  };
};

export const getUserById = async (
  userId: string | ObjectId,
  options?: { includeProfiles?: boolean },
): Promise<(UserModel & { profiles?: any[] }) | null> => {
  const db = await getDb();
  const usersCollection = db.collection<UserModel>('users');

  const _id = typeof userId === 'string' ? new ObjectId(userId) : userId;

  if (options?.includeProfiles) {
    const [userWithProfiles] = (await usersCollection
      .aggregate<UserModel & { profiles: any[] }>([
        { $match: { _id } },
        {
          $lookup: {
            from: 'profiles',
            localField: '_id',
            foreignField: 'userId',
            as: 'profiles',
          },
        },
      ])
      .toArray()) as Array<UserModel & { profiles: any[] }>;

    return userWithProfiles ?? null;
  } else {
    return await usersCollection.findOne({ _id });
  }
};

export const loginUser = async (email: string, password: string) => {
  const db = await getDb();
  const collection = db.collection<UserModel>('users');
  const encryptedPass = hash(password);

  const user = await collection.findOne({ email, password: encryptedPass });
  if (!user) {
    logger({
      level: 'warn',
      message: `Failed login attempt for email: ${email}`,
    });
    throw new InvalidCredentialsError();
  }

  logger({
    level: 'info',
    message: `Login success for user id ${user._id}`,
  });

  return user;
};

export const createAccessToken = async (userId: string) => {
  return await signJwt({ _id: userId });
};

export const createRefreshToken = async (userId: string) => {
  return await signJwt({ _id: userId });
};

export const verifyRefreshToken = async (token: string) => {
  return await verifyJwt(token);
};

export const updateUserActiveProfile = async (
  userId: string | ObjectId,
  activeProfileId: ObjectId,
) => {
  const db = await getDb();
  const usersCollection = db.collection<UserModel>('users');

  const _userId = typeof userId === 'string' ? new ObjectId(userId) : userId;

  const result = await usersCollection.findOneAndUpdate(
    { _id: _userId },
    { $set: { activeProfile: activeProfileId } },
    { returnDocument: 'after' },
  );

  return result;
};

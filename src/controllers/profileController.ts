import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Create an profile
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /profiles');

  try {
    const profile = { ...req.body };

    const db = await getDb();
    const collection = await db?.collection('profiles');
    await collection?.insertOne(profile);

    res.status(201).send(profile);
  } catch (error) {
    next(error);
  }
};

// Read all profiles
export const getProfiles = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /profiles');

  try {
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profiles = await collection?.find().toArray();

    res.status(200).json(profiles);
  } catch (error) {
    next(error);
  }
};

// Read single profile
export const getProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /profiles/id/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.findOne({ _id: id });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// Read single profile
export const getProfileByUri = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /profiles/uri/:uri');

  try {
    const { uri } = req.params;
    const targetId = new ObjectId(req.query.targetId as string);
    const db = await getDb();
    const collection = await db?.collection('profiles');

    function matchProfileByUri(uri: string) {
      return { $match: { uri } };
    }

    // === CONNECTED PROFILES ===

    function matchConnectedStatus() {
      return {
        $match: {
          $expr: {
            $and: [
              { $eq: ['$status', 'connected'] },
              { $in: ['$$profileId', '$between'] },
            ],
          },
        },
      };
    }

    function addOtherProfileId() {
      return {
        $addFields: {
          otherProfileId: {
            $cond: {
              if: { $eq: ['$$profileId', { $arrayElemAt: ['$between', 0] }] },
              then: { $arrayElemAt: ['$between', 1] },
              else: { $arrayElemAt: ['$between', 0] },
            },
          },
        },
      };
    }

    function lookupOtherProfile() {
      return {
        $lookup: {
          from: 'profiles',
          localField: 'otherProfileId',
          foreignField: '_id',
          as: 'otherProfile',
        },
      };
    }

    function unwindOtherProfile() {
      return { $unwind: '$otherProfile' };
    }

    function addOtherProfileField() {
      return {
        $addFields: {
          otherProfile: '$otherProfile',
        },
      };
    }

    function addIsTargetConnectionInsideConnections(targetId: ObjectId) {
      return {
        $addFields: {
          isTargetConnection: {
            $eq: ['$otherProfile._id', targetId],
          },
        },
      };
    }

    function lookupConnectedProfiles(targetId: ObjectId) {
      return {
        $lookup: {
          from: 'connections',
          let: { profileId: '$_id' },
          pipeline: [
            matchConnectedStatus(),
            addOtherProfileId(),
            lookupOtherProfile(),
            unwindOtherProfile(),
            addOtherProfileField(),
            addIsTargetConnectionInsideConnections(targetId),
            { $sample: { size: 3 } },
          ],
          as: 'connections',
        },
      };
    }

    function addIsConnectedWithTargetFromConnections() {
      return {
        $addFields: {
          isConnectedWithTarget: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$connections',
                    as: 'conn',
                    cond: { $eq: ['$$conn.isTargetConnection', true] },
                  },
                },
              },
              0,
            ],
          },
        },
      };
    }

    // === GROUPS ===

    function normalizeMembersArray() {
      return {
        $addFields: {
          membersArray: {
            $cond: [
              { $isArray: '$members' },
              '$members',
              {
                $cond: [
                  { $gt: [{ $type: '$members' }, 'missing'] },
                  [{ $ifNull: ['$members', {}] }],
                  [],
                ],
              },
            ],
          },
        },
      };
    }

    function matchProfileInMembers() {
      return {
        $match: {
          $expr: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$membersArray',
                    as: 'member',
                    cond: {
                      $eq: ['$$member.profileId', '$$profileId'],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      };
    }

    function lookupGroupsByMembership() {
      return {
        $lookup: {
          from: 'groups',
          let: { profileId: '$_id' },
          pipeline: [
            normalizeMembersArray(),
            matchProfileInMembers(),
            { $sample: { size: 3 } },
          ],
          as: 'groups',
        },
      };
    }

    const pipeline = [
      matchProfileByUri(uri),
      lookupConnectedProfiles(targetId),
      addIsConnectedWithTargetFromConnections(),
      lookupGroupsByMembership(),
    ];

    const profile = await collection.aggregate(pipeline).toArray();

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile[0]);
  } catch (error) {
    next(error);
  }
};

// Update single profile
export const updateProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /profiles/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.findOneAndUpdate(
      { _id: id },
      { $set: { ...req.body } },
      { returnDocument: 'after' },
    );

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

// Delete single profile
export const deleteProfileById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access DELETE /profiles/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = await db?.collection('profiles');
    const profile = await collection?.deleteOne({ _id: id });

    if (!profile.deletedCount) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

import { ObjectId } from 'mongodb';
import { getDb } from '@/config/db.ts';
import { logger } from '@/utils/logger.util.ts';

export const createProfile = async (
  userId: string,
  data: Record<string, unknown>,
) => {
  const db = await getDb();
  const collection = db.collection('profiles');

  const profile = {
    ...data,
    userId: new ObjectId(userId),
  };

  const result = await collection.insertOne(profile);

  logger({ level: 'info', message: `Created profile ${result.insertedId}` });

  return {
    ...profile,
    _id: result.insertedId,
  };
};

export const getProfileById = async (id: string) => {
  const db = await getDb();
  const collection = db.collection('profiles');
  const profile = await collection.findOne({ _id: new ObjectId(id) });

  if (!profile) {
    throw new Error('Profile not found');
  }

  logger({ level: 'info', message: `Fetched profile by ID: ${id}` });

  return profile;
};

export const getProfileByUri = async (uri: string, targetId: string) => {
  const db = await getDb();
  const collection = db.collection('profiles');

  const profile = await collection
    .aggregate([
      { $match: { uri } },
      {
        $lookup: {
          from: 'connections',
          let: { profileId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$status', 'connected'] },
                    { $in: ['$$profileId', '$between'] },
                  ],
                },
              },
            },
            {
              $addFields: {
                otherProfileId: {
                  $cond: [
                    { $eq: ['$$profileId', { $arrayElemAt: ['$between', 0] }] },
                    { $arrayElemAt: ['$between', 1] },
                    { $arrayElemAt: ['$between', 0] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                localField: 'otherProfileId',
                foreignField: '_id',
                as: 'otherProfile',
              },
            },
            { $unwind: '$otherProfile' },
            {
              $addFields: {
                isTargetConnection: {
                  $eq: ['$otherProfile._id', new ObjectId(targetId)],
                },
              },
            },
            { $sample: { size: 3 } },
          ],
          as: 'connections',
        },
      },
      {
        $lookup: {
          from: 'connections',
          let: { profileId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ['$status', ['connected', 'requested']] },
                    { $in: ['$$profileId', '$between'] },
                  ],
                },
              },
            },
            {
              $addFields: {
                otherProfileId: {
                  $cond: [
                    { $eq: ['$$profileId', { $arrayElemAt: ['$between', 0] }] },
                    { $arrayElemAt: ['$between', 1] },
                    { $arrayElemAt: ['$between', 0] },
                  ],
                },
              },
            },
            {
              $lookup: {
                from: 'profiles',
                localField: 'otherProfileId',
                foreignField: '_id',
                as: 'otherProfile',
              },
            },
            { $unwind: '$otherProfile' },
            {
              $addFields: {
                isTargetRelated: {
                  $eq: ['$otherProfile._id', new ObjectId(targetId)],
                },
              },
            },
            { $match: { isTargetRelated: true } },
            { $limit: 1 },
          ],
          as: 'relatedConnection',
        },
      },
      {
        $addFields: {
          requestedBy: {
            $cond: [
              { $gt: [{ $size: '$relatedConnection' }, 0] },
              {
                $let: {
                  vars: { conn: { $arrayElemAt: ['$relatedConnection', 0] } },
                  in: '$$conn.requestedBy',
                },
              },
              'none',
            ],
          },
          connectionStatus: {
            $cond: {
              if: {
                $eq: [
                  {
                    $let: {
                      vars: {
                        conn: { $arrayElemAt: ['$relatedConnection', 0] },
                      },
                      in: '$$conn.status',
                    },
                  },
                  'connected',
                ],
              },
              then: 'connected',
              else: {
                $cond: [
                  {
                    $ne: [
                      {
                        $cond: [
                          { $gt: [{ $size: '$relatedConnection' }, 0] },
                          {
                            $let: {
                              vars: {
                                conn: {
                                  $arrayElemAt: ['$relatedConnection', 0],
                                },
                              },
                              in: '$$conn.requestedBy',
                            },
                          },
                          'none',
                        ],
                      },
                      'none',
                    ],
                  },
                  'requested',
                  'none',
                ],
              },
            },
          },
        },
      },
      {
        $lookup: {
          from: 'groups',
          let: { profileId: '$_id' },
          pipeline: [
            {
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
            },
            {
              $match: {
                $expr: {
                  $gt: [
                    {
                      $size: {
                        $filter: {
                          input: '$membersArray',
                          as: 'member',
                          cond: { $eq: ['$$member.profileId', '$$profileId'] },
                        },
                      },
                    },
                    0,
                  ],
                },
              },
            },
            { $sample: { size: 3 } },
          ],
          as: 'groups',
        },
      },
    ])
    .toArray();

  if (!profile.length) {
    throw new Error('Profile not found');
  }

  logger({ level: 'info', message: `Fetched profile by URI: ${uri}` });

  return profile[0];
};

export const updateProfileById = async (
  userId: string,
  data: Record<string, unknown>,
) => {
  const db = await getDb();
  const collection = db.collection('profiles');
  const usersCollection = db.collection('users');

  const user = await usersCollection.findOne({ _id: new ObjectId(userId) });
  if (!user?.activeProfile) {
    throw new Error('User has no active profile');
  }

  const profile = await collection.findOneAndUpdate(
    { _id: user.activeProfile, userId: user._id },
    { $set: { ...data } },
    { returnDocument: 'after' },
  );

  if (!profile?.value) {
    throw new Error('Profile not found');
  }

  logger({ level: 'info', message: `Updated profile ${profile.value._id}` });

  return profile.value;
};

export const deleteProfileById = async (profileId: string, userId: string) => {
  const db = await getDb();
  const collection = db.collection('profiles');

  const result = await collection.deleteOne({
    _id: new ObjectId(profileId),
    userId: new ObjectId(userId),
  });

  if (!result.deletedCount) {
    throw new Error('Profile not found');
  }

  logger({ level: 'info', message: `Deleted profile ${profileId}` });

  return { _id: profileId };
};

export const getSuggestedProfiles = async (excludedIds: ObjectId[]) => {
  const db = await getDb();
  const profilesCollection = db.collection('profiles');

  return await profilesCollection
    .aggregate([
      { $match: { _id: { $nin: excludedIds } } },
      { $sample: { size: 3 } },
    ])
    .toArray();
};

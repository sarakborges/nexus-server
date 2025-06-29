import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Create an profile
export const createProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  console.log('Access POST /profiles');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const db = await getDb();
    const collection = db.collection('profiles');

    const profile = {
      ...req.body,
      userId: new ObjectId(req.user._id),
    };

    const result = await collection.insertOne(profile);

    res.status(201).json({
      ...profile,
      _id: result.insertedId,
    });
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
    const collection = db?.collection('profiles');
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

export async function fetchConnectionRequests(profileId: ObjectId) {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');

  const pipeline = [
    {
      $match: {
        status: 'requested',
        between: profileId,
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $in: [profileId, '$between'] },
            { $ne: ['$requestedBy', profileId] },
          ],
        },
      },
    },
    {
      $addFields: {
        otherProfileId: {
          $cond: [
            { $eq: [profileId, { $arrayElemAt: ['$between', 0] }] },
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

    // Ordenar por data da solicitação (mais recente primeiro)
    {
      $sort: { requestedConnectionAt: -1 },
    },
  ];

  const connectionRequests = await connectionsCollection
    .aggregate(pipeline)
    .toArray();

  return connectionRequests;
}

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
    const collection = db?.collection('profiles');

    // === MATCH DO PERFIL ===
    function matchProfileByUri(uri: string) {
      return { $match: { uri } };
    }

    // === CONEXÕES ===

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

    function matchRelevantStatuses() {
      return {
        $match: {
          $expr: {
            $and: [
              { $in: ['$status', ['connected', 'requested']] },
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

    function lookupRequestedOrConnected(targetId: ObjectId) {
      return {
        $lookup: {
          from: 'connections',
          let: { profileId: '$_id' },
          pipeline: [
            matchRelevantStatuses(),
            addOtherProfileId(),
            lookupOtherProfile(),
            unwindOtherProfile(),
            addOtherProfileField(),
            {
              $addFields: {
                isTargetRelated: {
                  $eq: ['$otherProfile._id', targetId],
                },
              },
            },
            { $match: { isTargetRelated: true } },
            { $limit: 1 },
          ],
          as: 'relatedConnection',
        },
      };
    }

    function addRequestedByToProfile() {
      return {
        $addFields: {
          requestedBy: {
            $ifNull: [
              {
                $let: {
                  vars: {
                    conn: { $arrayElemAt: ['$relatedConnection', 0] },
                  },
                  in: '$$conn.requestedBy',
                },
              },
              'none',
            ],
          },
        },
      };
    }

    function addConnectionStatusField() {
      return {
        $addFields: {
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
                $cond: [{ $ne: ['$requestedBy', 'none'] }, 'requested', 'none'],
              },
            },
          },
        },
      };
    }

    // === GRUPOS ===

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

    // === PIPELINE FINAL ===

    const pipeline = [
      matchProfileByUri(uri),
      lookupConnectedProfiles(targetId),
      lookupRequestedOrConnected(targetId),
      addRequestedByToProfile(),
      addConnectionStatusField(),
      lookupGroupsByMembership(),
    ];

    const profile = await collection.aggregate(pipeline).toArray();

    if (!profile || profile.length === 0) {
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
  console.log('Access PATCH /profiles');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Usuário não autenticado' });
      return;
    }

    const db = await getDb();
    const collection = db.collection('profiles');
    const usersCollection = db.collection('users');

    const userId = new ObjectId(req.user._id);

    const user = await usersCollection.findOne({ _id: userId });

    const profile = await collection?.findOneAndUpdate(
      { _id: user?.activeProfile, userId: user?._id },
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
    const _id = new ObjectId(req.params.id);
    const db = await getDb();
    const collection = db?.collection('profiles');

    const profile = await collection?.deleteOne({
      _id,
      userId: new ObjectId(req.user?._id),
    });

    if (!profile.deletedCount) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

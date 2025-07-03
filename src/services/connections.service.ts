import { ObjectId } from 'mongodb';

import { getDb } from '@/config/db.ts';
import {
  createNotification,
  deleteNotification,
} from '@/services/notifications.service.ts';

import { Notifications } from '@/enums/notifications.enum';

import { logger } from '@/utils/logger.util.ts';

export const createConnection = async (
  requesterProfileId: ObjectId,
  targetProfileId: string,
) => {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');

  const ids = [new ObjectId(targetProfileId), requesterProfileId];

  const newConnection = await connectionsCollection.insertOne({
    between: ids,
    requestedBy: requesterProfileId,
    status: 'requested',
    requestedConnectionAt: new Date(),
  });

  if (!newConnection.insertedId) {
    throw new Error('Failed to create connection');
  }

  await createNotification(
    requesterProfileId.toHexString(),
    targetProfileId,
    Notifications.ConnectionRequested,
  );

  logger({
    level: 'info',
    message: `Connection requested: ${newConnection.insertedId}`,
  });

  return newConnection.insertedId;
};

export const acceptConnection = async (
  userProfileId: ObjectId,
  connectionId: string,
) => {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');

  const ids = [new ObjectId(connectionId), userProfileId];

  const updated = await connectionsCollection.findOneAndUpdate(
    {
      requestedBy: { $nin: [userProfileId] },
      between: { $all: ids },
    },
    {
      $set: {
        status: 'connected',
        connectedSince: new Date(),
      },
    },
    { returnDocument: 'after' },
  );

  if (!updated?.value?._id) {
    throw new Error('Connection not found');
  }

  await createNotification(
    userProfileId.toHexString(),
    connectionId,
    Notifications.ConnectionRequestAccepted,
  );

  await deleteNotification({
    from: new ObjectId(connectionId),
    to: userProfileId,
    type: Notifications.ConnectionRequested,
  });

  logger({
    level: 'info',
    message: `Connection accepted: ${updated.value._id}`,
  });

  return updated.value;
};

export const deleteConnection = async (
  userProfileId: ObjectId,
  connectionId: string,
) => {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');

  const ids = [new ObjectId(connectionId), userProfileId];

  const deleted = await connectionsCollection.findOneAndDelete({
    between: { $all: ids },
  });

  if (!deleted?.value?._id) {
    throw new Error('Connection not found');
  }

  await deleteNotification({
    from: new ObjectId(connectionId),
    to: userProfileId,
    type: Notifications.ConnectionRequested,
  });

  logger({
    level: 'info',
    message: `Deleted connection: ${deleted.value._id}`,
  });

  return deleted.value._id;
};

export const getConnectedProfileIds = async (profileId: ObjectId) => {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');

  const connections = await connectionsCollection
    .aggregate([
      { $match: { between: { $in: [profileId] } } },
      {
        $addFields: {
          otherId: {
            $first: {
              $filter: {
                input: '$between',
                as: 'id',
                cond: { $ne: ['$$id', profileId] },
              },
            },
          },
        },
      },
    ])
    .toArray();

  return connections.map((c) => c.otherId);
};

export const getConnectionRequests = async (profileId: string) => {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');

  const pipeline = [
    {
      $match: {
        status: 'requested',
        between: new ObjectId(profileId),
      },
    },
    {
      $match: {
        $expr: {
          $and: [
            { $in: [new ObjectId(profileId), '$between'] },
            { $ne: ['$requestedBy', new ObjectId(profileId)] },
          ],
        },
      },
    },
    {
      $addFields: {
        otherProfileId: {
          $cond: [
            {
              $eq: [new ObjectId(profileId), { $arrayElemAt: ['$between', 0] }],
            },
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
      $sort: { requestedConnectionAt: -1 },
    },
  ];

  const connectionRequests = await connectionsCollection
    .aggregate(pipeline)
    .toArray();

  logger({
    level: 'info',
    message: `Fetched ${connectionRequests.length} connection requests for profile ${profileId}`,
  });

  return connectionRequests;
};

import { ObjectId } from 'mongodb';

import { getDb } from '@/config/db.ts';

import type { NotificationsModel } from '@/models/notifications.model.ts';

import { logger } from '@/utils/logger.util.ts';

export const createNotification = async (
  from: string,
  to: string,
  type: NotificationsModel['type'],
) => {
  const db = await getDb();
  const notificationsCollection =
    db.collection<NotificationsModel>('notifications');

  logger({
    level: 'info',
    message: `Creating notification: ${type} from ${from} to ${to}`,
  });

  const result = await notificationsCollection.insertOne({
    _id: new ObjectId(),
    from: new ObjectId(from),
    to: new ObjectId(to),
    type,
    at: new Date(),
  });

  if (!result.insertedId) {
    logger({ level: 'error', message: 'Notification creation failed' });
    throw new Error('Failed to create notification');
  }

  logger({
    level: 'info',
    message: `Notification created with id ${result.insertedId}`,
  });
  return result.insertedId;
};

export const deleteNotification = async (
  filter: Partial<NotificationsModel>,
) => {
  const db = await getDb();
  const notificationsCollection =
    db.collection<NotificationsModel>('notifications');

  logger({
    level: 'info',
    message: `Deleting notification with filter: ${JSON.stringify(filter)}`,
  });

  const result = await notificationsCollection.deleteOne(filter);

  if (!result.deletedCount) {
    logger({
      level: 'warn',
      message: 'Notification deletion failed or not found',
    });
    throw new Error('Failed to delete notification');
  }

  logger({ level: 'info', message: `Notification deleted successfully` });
  return true;
};

export const getNotificationsForProfile = async (profileId: ObjectId) => {
  const db = await getDb();
  const notifications = await db
    .collection('notifications')
    .aggregate([
      {
        $match: {
          $or: [
            { to: profileId },
            {
              $and: [
                { type: 'connectionRequestAccepted' },
                {
                  $or: [{ to: profileId }, { from: profileId }],
                },
              ],
            },
          ],
        },
      },
      {
        $addFields: {
          fromProfileId: {
            $cond: {
              if: {
                $in: [
                  '$type',
                  ['connectionRequested', 'connectionRequestAccepted'],
                ],
              },
              then: '$from',
              else: null,
            },
          },
          fromGroupId: {
            $cond: {
              if: { $eq: ['$type', 'membershipAccepted'] },
              then: '$from',
              else: null,
            },
          },
          toProfileId: '$to',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'fromProfileId',
          foreignField: '_id',
          as: 'fromProfileData',
        },
      },
      {
        $lookup: {
          from: 'groups',
          localField: 'fromGroupId',
          foreignField: '_id',
          as: 'fromGroupData',
        },
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'toProfileId',
          foreignField: '_id',
          as: 'toProfileData',
        },
      },
      {
        $addFields: {
          from: {
            $cond: {
              if: {
                $in: [
                  '$type',
                  ['connectionRequested', 'connectionRequestAccepted'],
                ],
              },
              then: { $arrayElemAt: ['$fromProfileData', 0] },
              else: { $arrayElemAt: ['$fromGroupData', 0] },
            },
          },
          to: { $arrayElemAt: ['$toProfileData', 0] },
        },
      },
      {
        $project: {
          fromProfileData: 0,
          fromGroupData: 0,
          toProfileData: 0,
          fromProfileId: 0,
          fromGroupId: 0,
          toProfileId: 0,
        },
      },
      { $sort: { at: -1 } },
    ])
    .toArray();

  return notifications;
};

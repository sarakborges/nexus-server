import { ObjectId } from 'mongodb';

import { getDb } from '@/config/db.ts';

export const createFeedItem = async (
  profileId: ObjectId,
  data: Record<string, any>,
) => {
  const db = await getDb();
  const feedCollection = db.collection('feed');

  const newFeedItem = await feedCollection.insertOne({
    profileId,
    ...data,
    createdAt: new Date(),
  });

  if (!newFeedItem.insertedId) {
    throw new Error('Failed to create feed item');
  }

  const [insertedFeedItem] = await feedCollection
    .aggregate([
      { $match: { _id: newFeedItem.insertedId } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'profileId',
          foreignField: '_id',
          as: 'profile',
        },
      },
      { $unwind: '$profile' },
    ])
    .toArray();

  return insertedFeedItem;
};

export const getFeedForProfile = async (profileId: ObjectId) => {
  const db = await getDb();

  const connections = await db
    .collection('connections')
    .find({
      status: 'connected',
      between: { $in: [profileId] },
    })
    .toArray();

  const connectionIds = connections.map((conn) => {
    const [a, b] = conn.between;
    return a.equals(profileId) ? b : a;
  });

  const allProfileIds = [profileId, ...connectionIds];

  const feed = await db
    .collection('feed')
    .aggregate([
      { $match: { profileId: { $in: allProfileIds } } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'profileId',
          foreignField: '_id',
          as: 'profile',
        },
      },
      { $unwind: '$profile' },
      { $sort: { createdAt: -1 } },
    ])
    .toArray();

  return feed;
};

export const deleteFeedItem = async (
  feedItemId: ObjectId,
  profileId: ObjectId,
) => {
  const db = await getDb();
  const feedCollection = db.collection('feed');

  const result = await feedCollection.deleteOne({
    _id: feedItemId,
    profileId,
  });

  if (!result.deletedCount) {
    throw new Error('Feed item not found or unauthorized');
  }

  return true;
};

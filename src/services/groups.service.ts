import { ObjectId } from 'mongodb';

import { getDb } from '@/config/db.ts';

export const getGroupIdsByProfile = async (profileId: ObjectId) => {
  const db = await getDb();
  const groupsCollection = db.collection('groups');

  const groups = await groupsCollection
    .find({ members: { $in: [profileId] } })
    .toArray();

  return groups.map((g) => g._id);
};

export const getSuggestedGroups = async (excludedGroupIds: ObjectId[]) => {
  const db = await getDb();
  const groupsCollection = db.collection('groups');

  return await groupsCollection
    .aggregate([
      { $match: { _id: { $nin: excludedGroupIds } } },
      { $sample: { size: 3 } },
    ])
    .toArray();
};

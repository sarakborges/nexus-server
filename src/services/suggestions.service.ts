import { ObjectId } from 'mongodb';

import { getDb } from '@/config/db.ts';

import { SuggestionTypes } from '@/enums/suggestionTypes.enum';

export const getSuggestionsForProfile = async (profileId: ObjectId) => {
  const db = await getDb();
  const profilesCollection = db.collection('profiles');
  const connectionsCollection = db.collection('connections');
  const groupsCollection = db.collection('groups');

  const excludedGroupIds = await groupsCollection
    .find({ members: { $in: [profileId] } })
    .project({ _id: 1 })
    .toArray()
    .then((groups) => groups.map((g) => g._id));

  const suggestedGroups = await groupsCollection
    .aggregate([
      { $match: { _id: { $nin: excludedGroupIds } } },
      { $sample: { size: 3 } },
    ])
    .toArray();

  const connectedProfiles = await connectionsCollection
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
      { $project: { _id: 0, otherId: 1, status: 1 } },
    ])
    .toArray();

  const excludedProfileIds = connectedProfiles.map((c) => c.otherId);

  const suggestedProfiles = await profilesCollection
    .aggregate([
      { $match: { _id: { $nin: excludedProfileIds.concat([profileId]) } } },
      { $sample: { size: 3 } },
    ])
    .toArray();

  return [
    {
      type: SuggestionTypes.Profiles,
      suggestions: suggestedProfiles,
    },

    {
      type: SuggestionTypes.Groups,
      suggestions: suggestedGroups,
    },
  ];
};

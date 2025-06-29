import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

export async function fetchSuggestionsForProfile(profileId: ObjectId) {
  const db = await getDb();
  const connectionsCollection = db.collection('connections');
  const profilesCollection = db.collection('profiles');
  const groupsCollection = db.collection('groups');

  // Buscar conexões do perfil
  const connections = await connectionsCollection
    .aggregate([
      {
        $match: {
          between: { $in: [profileId] },
        },
      },
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

  // Grupos do perfil
  const groupsAsMember = await groupsCollection
    .find({
      members: { $in: [profileId] },
    })
    .toArray();

  // Sugestões de perfis (excluindo próprio e conexões)
  const profiles = await profilesCollection
    .aggregate([
      {
        $match: {
          _id: {
            $nin: [profileId, ...connections.map((c) => c.otherId)],
          },
        },
      },
      { $sample: { size: 3 } },
    ])
    .toArray();

  // Sugestões de grupos (excluindo os que já participa)
  const groups = await groupsCollection
    .aggregate([
      { $match: { _id: { $nin: groupsAsMember.map((g) => g._id) } } },
      { $sample: { size: 3 } },
    ])
    .toArray();

  return [
    { type: 'profile', suggestions: profiles },
    { type: 'group', suggestions: groups },
  ];
}

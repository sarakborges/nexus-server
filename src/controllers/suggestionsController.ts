import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db';
import { ObjectId } from 'mongodb';

interface Suggestion<T> {
  type: 'profile' | 'group';
  suggestions: T[];
}

export const getSuggestionsByProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  console.log('Access GET /suggestions');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const userId = new ObjectId(req.user._id);
    const db = await getDb();

    // Collections não são async, não precisa de await aqui
    const usersCollection = db.collection('users');
    const profilesCollection = db.collection('profiles');
    const groupsCollection = db.collection('groups');

    // Buscar usuário
    const user = await usersCollection.findOne({ _id: userId });

    if (!user) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    // Buscar perfil ativo do usuário
    const profile = await profilesCollection.findOne({
      _id: user.activeProfile,
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    const connections: ObjectId[] = Array.isArray(profile.connections)
      ? profile.connections
      : [];
    const groupsIn: ObjectId[] = Array.isArray(profile.groups)
      ? profile.groups
      : [];

    // Sugestões de perfis (exclui o próprio e conexões)
    const profiles = await profilesCollection
      .aggregate([
        { $match: { _id: { $nin: [userId, ...connections] } } },
        { $sample: { size: 3 } },
      ])
      .toArray();

    // Sugestões de grupos (exclui os que já participa)
    const groups = await groupsCollection
      .aggregate([
        { $match: { _id: { $nin: groupsIn } } },
        { $sample: { size: 3 } },
      ])
      .toArray();

    if (profiles.length === 0 && groups.length === 0) {
      res.status(404).json({ message: 'No suggestions found' });
      return;
    }

    const suggestions: Suggestion<any>[] = [
      { type: 'profile', suggestions: profiles },
      { type: 'group', suggestions: groups },
    ];

    res.status(200).json(suggestions);
  } catch (error) {
    next(error);
  }
};

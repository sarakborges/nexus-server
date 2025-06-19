import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Read all feed from profile
export const createNewFeedItem = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /feed');

  try {
    const db = await getDb();
    const feedCollection = db.collection('feed');

    console.log('Attempting to insert new Feed Item', req.body);

    const { profileId, ...bodyRest } = req.body;
    const id = new ObjectId(profileId as string);

    const newFeedItem = await feedCollection?.insertOne({
      profileId: id,
      ...bodyRest,
      createdAt: new Date(),
    });

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

    console.log('Inserted new Feed Item:', insertedFeedItem);
    res.status(201).send(insertedFeedItem);
  } catch (error) {
    next(error);
  }
};

// Read all feed from profile
export const getFeedByProfile = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access GET /feed/:id');

  try {
    const id = new ObjectId(req.params.id);
    const db = await getDb();

    // 1. Buscar conexões
    const connections = await db
      .collection('connections')
      .find({
        status: 'connected',
        between: { $in: [id] },
      })
      .toArray();

    // 2. Extrair os outros perfis conectados
    const connectionIds = connections.map((conn) => {
      const [a, b] = conn.between;
      return a.equals(id) ? b : a;
    });

    // 3. Incluir o próprio perfil
    const allProfileIds = [id, ...connectionIds];

    const feed = await db
      .collection('feed')
      .aggregate([
        // 4. Buscar todos os posts do perfil + conexões
        {
          $match: {
            profileId: { $in: allProfileIds },
          },
        },

        // 5. Trazer dados do autor do post
        {
          $lookup: {
            from: 'profiles',
            localField: 'profileId',
            foreignField: '_id',
            as: 'profile',
          },
        },
        {
          $unwind: '$profile',
        },

        // 6. (Opcional) Ordenar por data
        {
          $sort: { createdAt: -1 },
        },
      ])
      .toArray();

    if (!feed?.length) {
      res.status(404).json({ message: 'No feed found' });
      return;
    }

    res.status(200).json(feed);
  } catch (error) {
    next(error);
  }
};

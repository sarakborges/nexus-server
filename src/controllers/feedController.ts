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
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userId = new ObjectId(req.user._id);
    const user = await usersCollection.findOne({ _id: userId });

    const feedCollection = await db?.collection('feed');

    console.log('Attempting to insert new Feed Item', req.body);

    const newFeedItem = await feedCollection?.insertOne({
      profileId: user?.activeProfile,
      ...req.body,
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
  console.log('Access GET /feed');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userId = new ObjectId(req.user._id);
    const user = await usersCollection.findOne({ _id: userId });

    const id = new ObjectId(user?.activeProfile);

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

// Delete single feed item
export const deleteFeedItemById = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access DELETE /feed/:id');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const db = await getDb();
    const usersCollection = db.collection('users');

    const userId = new ObjectId(req.user._id);
    const user = await usersCollection.findOne({ _id: userId });

    const id = new ObjectId(req.params.id);
    const collection = await db?.collection('feed');
    const profile = await collection?.deleteOne({
      _id: id,
      profileId: user?.activeProfile,
    });

    if (!profile.deletedCount) {
      res.status(404).json({ message: 'Feed item not found' });
      return;
    }

    res.status(200).json(profile);
  } catch (error) {
    next(error);
  }
};

import type { Request, Response, NextFunction } from 'express';
import { getDb } from '../config/db.ts';
import { ObjectId } from 'mongodb';

// Create new connection
export const createConnection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access POST /connections');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const db = await getDb();
    const connectionsCollection = db.collection('connections');
    const usersCollection = db.collection('users');
    const notificationsCollection = db.collection('notifications');

    const userId = new ObjectId(req.user._id);
    const user = await usersCollection.findOne({ _id: userId });

    const { profileId } = req.body;
    const ids = [profileId, user?.activeProfile].map(
      (item) => new ObjectId(item as string),
    );

    const newConnection = await connectionsCollection?.insertOne({
      between: ids,
      requestedBy: new ObjectId(user?.activeProfile as string),
      status: 'requested',
      requestedConnectionAt: new Date(),
    });

    if (!newConnection?.insertedId) {
      res.status(204).send();
      return;
    }

    const newNotification = await notificationsCollection.insertOne({
      from: user?.activeProfile,
      to: new ObjectId(profileId as string),
      type: 'connectionRequested',
      at: new Date(),
    });

    if (!newNotification?.insertedId) {
      res.status(204).send();
      return;
    }

    console.log('Requested connection:', newConnection.insertedId);
    res.status(201).send({ ...newConnection, _id: newConnection.insertedId });
  } catch (error) {
    next(error);
  }
};

// Accept connection
export const acceptConnection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access PATCH /connections/:id');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const db = await getDb();
    const connectionsCollection = db.collection('connections');
    const notificationsCollection = db.collection('notifications');
    const usersCollection = db.collection('users');

    const userId = new ObjectId(req.user._id);
    const user = await usersCollection.findOne({ _id: userId });

    console.log('Attempting to accept Connection');

    const { id } = req.params;
    const ids = [id, user?.activeProfile].map(
      (item) => new ObjectId(item as string),
    );

    const newConnection = await connectionsCollection?.findOneAndUpdate(
      {
        requestedBy: { $nin: [user?.activeProfile] },
        between: { $all: ids },
      },

      {
        $set: {
          status: 'connected',
          connectedSince: new Date(),
        },
      },
    );

    if (!newConnection?._id) {
      res.status(204).send();
      return;
    }

    const newNotification = await notificationsCollection.insertOne({
      from: user?.activeProfile,
      to: new ObjectId(id),
      type: 'connectionRequestAccepted',
      at: new Date(),
    });

    if (!newNotification?.insertedId) {
      res.status(204).send();
      return;
    }

    res.status(200).send(newConnection);
  } catch (error) {
    next(error);
  }
};

// Delete connection
export const deleteConnection = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.log('Access DELETE /connections/:id');

  try {
    if (!req.user?._id) {
      res.status(401).json({ message: 'Non authenticated' });
      return;
    }

    const db = await getDb();
    const connectionsCollection = db.collection('connections');
    const usersCollection = db.collection('users');
    const notificationsCollection = db.collection('notifications');

    const userId = new ObjectId(req.user._id);
    const user = await usersCollection.findOne({ _id: userId });

    const { id } = req.params;
    const ids = [id, user?.activeProfile].map(
      (item) => new ObjectId(item as string),
    );

    console.log('Attempting to delete Connection', ids);
    const newConnection = await connectionsCollection?.findOneAndDelete({
      between: { $all: ids },
    });

    if (!newConnection?._id) {
      res.status(204).send();
      return;
    }

    const newNotification = await notificationsCollection.deleteOne({
      from: new ObjectId(id),
      to: new ObjectId(user?.activeProfile as string),
      type: { $in: ['connectionRequested', 'connectionRequestAccepted'] },
    });

    if (!newNotification?.deletedCount) {
      res.status(204).send();
      return;
    }

    res.status(200).send(newConnection?._id);
  } catch (error) {
    next(error);
  }
};

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
    const db = await getDb();
    const connectionsCollection = db.collection('connections');

    console.log('Attempting to insert new Connection', req.body);

    const { between } = req.body;
    const ids = [...between].map((item) => new ObjectId(item as string));

    const newConnection = await connectionsCollection?.insertOne({
      between: ids,
      requestedBy: new ObjectId(req.body.requestedBy as string),
      status: 'requested',
      requestedConnectionAt: new Date(),
    });

    console.log('Inserted new Feed Item:', newConnection.insertedId);
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
  console.log('Access PATCH /connections/accept');

  try {
    const db = await getDb();
    const connectionsCollection = db.collection('connections');

    console.log('Attempting to accept Connection', req.body);

    const { between } = req.body;
    const ids = [...between].map((item) => new ObjectId(item as string));

    const newConnection = await connectionsCollection?.findOneAndUpdate(
      {
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
  console.log('Access DELETE /connections');

  try {
    const db = await getDb();
    const connectionsCollection = db.collection('connections');

    console.log('Attempting to delete Connection', req.body);

    const { between } = req.body;
    const ids = [...between].map((item) => new ObjectId(item as string));

    const newConnection = await connectionsCollection?.findOneAndDelete({
      between: { $all: ids },
    });

    if (!newConnection?._id) {
      res.status(204).send();
      return;
    }

    res.status(200).send(newConnection?._id);
  } catch (error) {
    next(error);
  }
};

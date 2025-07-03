import { ObjectId } from 'mongodb';

export type FeedItemModel = {
  _id: ObjectId;
  createdAt: Date;
  profileId: ObjectId;
  content?: string;
  picture?: string;
};

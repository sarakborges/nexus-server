import { ObjectId } from 'mongodb';

export type GroupType = {
  _id: ObjectId;
  name: string;
  uri: string;
  picture?: string;
};

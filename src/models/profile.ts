import { ObjectId } from 'mongodb';

export type Profile = {
  id: ObjectId;
  userId: ObjectId;
  name: string;
  picture: string;
  uri: string;
};
